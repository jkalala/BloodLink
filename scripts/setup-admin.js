const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setupAdmin(uid) {
  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    // Update user document
    await admin.firestore()
      .collection('users')
      .doc(uid)
      .update({
        isAdmin: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    console.log('Successfully set up admin user:', uid);
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    process.exit();
  }
}

// Get UID from command line argument
const uid = process.argv[2];
if (!uid) {
  console.error('Please provide a user UID as an argument');
  process.exit(1);
}

setupAdmin(uid); 