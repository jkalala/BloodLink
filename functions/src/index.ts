import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as geofire from 'geofire-common';
import type { Change, EventContext } from 'firebase-functions';
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import twilio from 'twilio';
import { geohashForLocation } from 'geofire-common';
import type { DonorData, EmergencyRequest, HospitalData } from './types';

admin.initializeApp();

// Initialize Twilio client
const twilioClient = twilio(
  functions.config().twilio.account_sid,
  functions.config().twilio.auth_token
);

interface Location {
  latitude: number;
  longitude: number;
  geohash?: string;
}

interface UserData {
  location?: Location;
  userType?: 'donor' | 'hospital';
  bloodType?: string;
  isAvailable?: boolean;
  phone?: string;
}

// Update geohash when location changes
export const updateGeohash = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (
    change: Change<QueryDocumentSnapshot>,
    context: EventContext
  ) => {
    const newData = change.after.data() as UserData;
    const oldData = change.before.data() as UserData;

    // Only update if location has changed
    if (
      newData?.location?.latitude === oldData?.location?.latitude &&
      newData?.location?.longitude === oldData?.location?.longitude
    ) {
      return null;
    }

    const location = newData?.location;
    if (!location?.latitude || !location?.longitude) {
      return null;
    }

    // Generate geohash
    const geohash = geofire.geohashForLocation([
      location.latitude,
      location.longitude,
    ] as [number, number]);

    // Update the document with the new geohash
    return change.after.ref.update({
      'location.geohash': geohash,
    });
  });

// Handle emergency request creation
export const onEmergencyRequestCreated = functions.firestore
  .document('emergencies/{requestId}')
  .onCreate(async (
    snap: DocumentSnapshot,
    context: EventContext
  ) => {
    const requestData = snap.data();
    if (!requestData) return null;

    // Update request location with geohash
    const geohash = geofire.geohashForLocation([
      requestData.location.latitude,
      requestData.location.longitude,
    ] as [number, number]);

    // Find nearby donors
    const center: [number, number] = [
      requestData.location.latitude,
      requestData.location.longitude,
    ];
    const radiusInKm = 50; // Search within 50km radius

    const bounds = geofire.geohashQueryBounds(center, radiusInKm * 1000);
    const matchingDonors: Array<{
      donorId: string;
      phone: string;
      status: 'NOTIFIED';
      notifiedAt: admin.firestore.Timestamp;
    }> = [];

    // Query for matching donors
    const queries = bounds.map((b) => {
      return admin
        .firestore()
        .collection('users')
        .where('userType', '==', 'donor')
        .where('bloodType', '==', requestData.bloodType)
        .where('isAvailable', '==', true)
        .where('location.geohash', '>=', b[0])
        .where('location.geohash', '<=', b[1])
        .get();
    });

    // Get all matching donors
    const snapshots = await Promise.all(queries);
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const donor = doc.data() as UserData;
        if (!donor.location?.latitude || !donor.location?.longitude || !donor.phone) continue;

        const distanceInKm = geofire.distanceBetween(
          [donor.location.latitude, donor.location.longitude] as [number, number],
          center
        );

        if (distanceInKm <= radiusInKm) {
          matchingDonors.push({
            donorId: doc.id,
            phone: donor.phone,
            status: 'NOTIFIED',
            notifiedAt: admin.firestore.Timestamp.now(),
          });
        }
      }
    }

    // Update request with geohash and matched donors
    return snap.ref.update({
      'location.geohash': geohash,
      matchedDonors: matchingDonors,
      smsStatus: 'PENDING',
    });
  });

// Send SMS notifications to matched donors
export const sendDonorNotifications = functions.firestore
  .document('emergencies/{requestId}')
  .onUpdate(async (
    change: Change<QueryDocumentSnapshot>,
    context: EventContext
  ) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Only proceed if SMS status changed to PENDING
    if (
      newData?.smsStatus !== 'PENDING' ||
      oldData?.smsStatus === 'PENDING'
    ) {
      return null;
    }

    const matchedDonors = newData.matchedDonors || [];

    // Get donor phone numbers
    const donorSnaps = await Promise.all(
      matchedDonors.map((match: { donorId: string; phone: string; status: string }) =>
        admin.firestore().collection('users').doc(match.donorId).get()
      )
    );

    const donorPhones = donorSnaps
      .map((snap) => (snap.data() as UserData)?.phone)
      .filter(Boolean);

    // TODO: Integrate with SMS service
    // For now, just update the status
    return change.after.ref.update({
      smsStatus: 'SENT',
    });
  });

// Send SMS notification to matched donors
export const notifyMatchedDonors = functions.firestore
  .document('emergencies/{emergencyId}')
  .onCreate(async (snap, context) => {
    const emergencyData = snap.data();
    if (!emergencyData) return;

    const emergency = {
      id: snap.id,
      ...emergencyData,
      createdAt: emergencyData.createdAt,
      updatedAt: emergencyData.updatedAt,
    } as unknown as EmergencyRequest;

    try {
      // Get all available donors with matching blood type
      const donorsSnapshot = await admin.firestore()
        .collection('users')
        .where('type', '==', 'donor')
        .where('bloodType', '==', emergency.bloodType)
        .where('isAvailable', '==', true)
        .get();

      const donors = donorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonorData[];

      // Send SMS to each matched donor
      const smsPromises = donors.map(async (donor) => {
        if (!donor.phone) return;

        const message = `URGENT: Blood donation needed!\n` +
          `Blood Type: ${emergency.bloodType}\n` +
          `Units: ${emergency.units}\n` +
          `Urgency: ${emergency.urgency}\n` +
          `Reply YES to respond to this request.`;

        try {
          await twilioClient.messages.create({
            body: message,
            to: donor.phone,
            from: functions.config().twilio.phone_number
          });

          // Update emergency request with SMS status
          await snap.ref.update({
            smsStatus: 'SENT',
            matchedDonors: admin.firestore.FieldValue.arrayUnion({
              donorId: donor.id,
              phone: donor.phone,
              status: 'NOTIFIED',
              notifiedAt: admin.firestore.FieldValue.serverTimestamp()
            })
          });
        } catch (error) {
          console.error(`Failed to send SMS to donor ${donor.id}:`, error);
        }
      });

      await Promise.all(smsPromises);
    } catch (error) {
      console.error('Error in notifyMatchedDonors:', error);
    }
  });

// Handle donor responses via SMS
export const handleDonorResponse = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { From: donorPhone, Body: response } = req.body;
  const normalizedResponse = response.trim().toLowerCase();

  if (normalizedResponse !== 'yes') {
    res.status(200).send('Invalid response');
    return;
  }

  try {
    // Find the most recent emergency request that notified this donor
    const emergenciesSnapshot = await admin.firestore()
      .collection('emergencies')
      .where('matchedDonors', 'array-contains', {
        phone: donorPhone,
        status: 'NOTIFIED'
      })
      .where('status', 'in', ['PENDING', 'ACTIVE'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (emergenciesSnapshot.empty) {
      res.status(200).send('No active emergency requests found');
      return;
    }

    const emergencyDoc = emergenciesSnapshot.docs[0];
    const emergencyData = emergencyDoc.data();
    if (!emergencyData) {
      res.status(404).send('Emergency request not found');
      return;
    }

    const emergency = {
      id: emergencyDoc.id,
      ...emergencyData,
      createdAt: emergencyData.createdAt,
      updatedAt: emergencyData.updatedAt,
    } as unknown as EmergencyRequest;

    // Find the donor's user document
    const donorsSnapshot = await admin.firestore()
      .collection('users')
      .where('phone', '==', donorPhone)
      .limit(1)
      .get();

    if (donorsSnapshot.empty) {
      res.status(200).send('Donor not found');
      return;
    }

    const donorDoc = donorsSnapshot.docs[0];
    const donor = donorDoc.data() as DonorData;

    // Update emergency request with donor's response
    const updatedMatchedDonors = emergency.matchedDonors?.map((match) => {
      if (typeof match === 'string') return match;
      return match.phone === donorPhone
        ? { ...match, status: 'RESPONDED', respondedAt: admin.firestore.FieldValue.serverTimestamp() }
        : match;
    }) || [];

    await emergencyDoc.ref.update({
      matchedDonors: updatedMatchedDonors
    });

    // Send confirmation SMS to donor
    await twilioClient.messages.create({
      body: `Thank you for responding! Please open the BloodLink app to schedule your donation.`,
      to: donor.phone,
      from: functions.config().twilio.phone_number
    });

    res.status(200).send('Response recorded');
  } catch (error) {
    console.error('Error in handleDonorResponse:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Send donation reminders
export const sendDonationReminders = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const threeMonthsAgo = new Date(now.toDate().setMonth(now.toDate().getMonth() - 3));

    try {
      // Get donors who haven't donated in the last 3 months
      const donorsSnapshot = await admin.firestore()
        .collection('users')
        .where('type', '==', 'donor')
        .where('lastDonation', '<', threeMonthsAgo)
        .where('isAvailable', '==', true)
        .get();

      const reminderPromises = donorsSnapshot.docs.map(async (doc) => {
        const donor = doc.data() as DonorData;
        if (!donor.phone) return;

        const message = `BloodLink Reminder: It's been 3 months since your last donation. ` +
          `Your blood type (${donor.bloodType}) is always in demand. ` +
          `Please consider donating again soon!`;

        try {
          await twilioClient.messages.create({
            body: message,
            to: donor.phone,
            from: functions.config().twilio.phone_number
          });

          // Update last reminder sent timestamp
          await doc.ref.update({
            lastReminderSent: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (error) {
          console.error(`Failed to send reminder to donor ${doc.id}:`, error);
        }
      });

      await Promise.all(reminderPromises);
    } catch (error) {
      console.error('Error in sendDonationReminders:', error);
    }
  });

// Send verification status notification to hospital
export const notifyHospitalVerification = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data() as HospitalData;
    const afterData = change.after.data() as HospitalData;

    // Only proceed if verification status changed
    if (beforeData.verificationStatus === afterData.verificationStatus) {
      return;
    }

    try {
      const message = afterData.verificationStatus === 'VERIFIED'
        ? `Your hospital verification has been approved. You can now create emergency blood requests.`
        : afterData.verificationStatus === 'REJECTED'
          ? `Your hospital verification has been rejected. Please submit a new verification document.`
          : null;

      if (message && afterData.phone) {
        await twilioClient.messages.create({
          body: message,
          to: afterData.phone,
          from: functions.config().twilio.phone_number
        });
      }
    } catch (error) {
      console.error('Error sending verification notification:', error);
    }
  });

// Set admin claims for authorized users
export const setAdminClaims = functions.https.onCall(async (data, context) => {
  // Only allow setting admin claims from a secure context (like your admin panel)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only authenticated users can set admin claims'
    );
  }

  // Check if the caller is already an admin
  const callerUid = context.auth.uid;
  const callerUser = await admin.auth().getUser(callerUid);
  if (!callerUser.customClaims?.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can set admin claims'
    );
  }

  const { targetUid, isAdmin } = data;
  if (!targetUid || typeof isAdmin !== 'boolean') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'targetUid and isAdmin are required'
    );
  }

  try {
    // Set custom claims for the target user
    await admin.auth().setCustomUserClaims(targetUid, { admin: isAdmin });

    // Update the user's role in Firestore
    await admin.firestore()
      .collection('users')
      .doc(targetUid)
      .update({
        isAdmin,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error('Error setting admin claims:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to set admin claims'
    );
  }
}); 