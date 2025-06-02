import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import type { EmergencyRequest } from '../types';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import DonorAvailabilityToggle from '../components/DonorAvailabilityToggle';
import MatchedRequestsList from '../components/MatchedRequestsList';

export default function HomeScreen() {
  const navigation = useNavigation<RootStackScreenProps<'Home'>['navigation']>();
  const { userType, userData, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    if (!userData) return;

    let unsubscribe: (() => void) | undefined;

    if (userType === 'donor') {
      const donorData = userData as { bloodType: string; location: { latitude: number; longitude: number } };
      // Query for emergency requests matching donor's blood type
      const q = firestore()
        .collection('emergencies')
        .where('bloodType', '==', donorData.bloodType)
        .where('status', 'in', ['PENDING', 'ACTIVE'])
        .orderBy('urgency', 'desc')
        .orderBy('createdAt', 'desc');

      unsubscribe = q.onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const requests = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as EmergencyRequest[];
        setEmergencyRequests(requests);
      });
    } else if (userType === 'hospital') {
      const hospitalData = userData as { id: string };
      // Query for hospital's emergency requests
      const q = firestore()
        .collection('emergencies')
        .where('hospitalId', '==', hospitalData.id)
        .orderBy('createdAt', 'desc');

      unsubscribe = q.onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const requests = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as EmergencyRequest[];
        setEmergencyRequests(requests);
      });
    }

    return () => unsubscribe?.();
  }, [userType, userData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh logic will be handled by the Firestore listeners
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const renderDonorHome = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {userData?.phone}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileLink}>View Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <DonorAvailabilityToggle />
        <MatchedRequestsList />
      </ScrollView>
    </>
  );

  const renderHospitalHome = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {(userData as any)?.name}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileLink}>View Profile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.newRequestButton}
        onPress={() => navigation.navigate('Emergency' as never)}
      >
        <Text style={styles.newRequestButtonText}>New Emergency Request</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Requests</Text>
        {emergencyRequests.length === 0 ? (
          <Text style={styles.emptyText}>No emergency requests yet</Text>
        ) : (
          emergencyRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              style={[styles.requestCard, request.urgency === 'CRITICAL' && styles.criticalCard]}
              onPress={() => navigation.navigate('Emergency', { requestId: request.id })}
            >
              <View style={styles.requestHeader}>
                <Text style={styles.bloodType}>{request.bloodType.replace('_', '+')}</Text>
                <Text style={[styles.urgency, styles[`urgency${request.urgency}`]]}>
                  {request.urgency}
                </Text>
              </View>
              <Text style={styles.status}>Status: {request.status}</Text>
              <Text style={styles.units}>{request.units} units requested</Text>
              <Text style={styles.time}>
                {request.createdAt instanceof FirebaseFirestoreTypes.Timestamp
                  ? request.createdAt.toDate().toLocaleString()
                  : new Date(request.createdAt).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {userType === 'donor' ? renderDonorHome() : renderHospitalHome()}
      </ScrollView>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  profileLink: {
    fontSize: 16,
    color: '#e53e3e',
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 24,
  },
  requestCard: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  criticalCard: {
    borderColor: '#e53e3e',
    backgroundColor: '#fff5f5',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bloodType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  urgency: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgencyLOW: {
    backgroundColor: '#c6f6d5',
    color: '#2f855a',
  },
  urgencyMEDIUM: {
    backgroundColor: '#fefcbf',
    color: '#975a16',
  },
  urgencyHIGH: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
  },
  urgencyCRITICAL: {
    backgroundColor: '#e53e3e',
    color: '#ffffff',
  },
  units: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 4,
  },
  status: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#718096',
  },
  newRequestButton: {
    backgroundColor: '#e53e3e',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  newRequestButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#f7fafc',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  signOutButtonText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '600',
  },
}); 