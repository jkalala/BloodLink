import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { HospitalData } from '../../functions/src/types';

export default function AdminDashboardScreen() {
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(null);

  const fetchHospitals = async () => {
    try {
      const snapshot = await firestore()
        .collection('users')
        .where('type', '==', 'hospital')
        .where('verificationStatus', 'in', ['PENDING', 'REJECTED'])
        .orderBy('verificationSubmittedAt', 'desc')
        .get();

      const hospitalList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HospitalData[];

      setHospitals(hospitalList);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      Alert.alert('Error', 'Failed to load hospital verifications');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHospitals();
  };

  const handleVerify = async (hospital: HospitalData, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await firestore()
        .collection('users')
        .doc(hospital.id)
        .update({
          verificationStatus: status,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Send SMS notification to hospital
      const message = status === 'VERIFIED'
        ? `Your hospital verification has been approved. You can now create emergency blood requests.`
        : `Your hospital verification has been rejected. Please submit a new verification document.`;

      // TODO: Implement SMS sending through Cloud Functions

      Alert.alert(
        'Success',
        `Hospital ${status === 'VERIFIED' ? 'verified' : 'rejected'} successfully`
      );

      // Refresh the list
      fetchHospitals();
    } catch (error) {
      console.error('Error updating hospital verification:', error);
      Alert.alert('Error', 'Failed to update hospital verification');
    }
  };

  const renderHospitalItem = (hospital: HospitalData) => (
    <View key={hospital.id} style={styles.hospitalCard}>
      <View style={styles.hospitalHeader}>
        <Text style={styles.hospitalName}>{hospital.name}</Text>
        <Text style={[
          styles.status,
          hospital.verificationStatus === 'PENDING' ? styles.pendingStatus : styles.rejectedStatus
        ]}>
          {hospital.verificationStatus}
        </Text>
      </View>

      <View style={styles.hospitalDetails}>
        <Text style={styles.detailText}>Code: {hospital.code}</Text>
        <Text style={styles.detailText}>Email: {hospital.email}</Text>
        <Text style={styles.detailText}>Phone: {hospital.phone}</Text>
        <Text style={styles.detailText}>
          Submitted: {hospital.verificationSubmittedAt?.toDate().toLocaleString()}
        </Text>
      </View>

      {hospital.verificationDocument && (
        <TouchableOpacity
          style={styles.viewDocumentButton}
          onPress={() => {
            // TODO: Implement document viewer
            Alert.alert('Coming Soon', 'Document viewer will be available soon');
          }}
        >
          <Text style={styles.viewDocumentButtonText}>View Verification Document</Text>
        </TouchableOpacity>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.verifyButton]}
          onPress={() => handleVerify(hospital, 'VERIFIED')}
        >
          <Text style={styles.actionButtonText}>Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleVerify(hospital, 'REJECTED')}
        >
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e53e3e" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hospital Verifications</Text>
          <Text style={styles.subtitle}>
            Review and verify hospital registration documents
          </Text>
        </View>

        {hospitals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No pending hospital verifications
            </Text>
          </View>
        ) : (
          hospitals.map(renderHospitalItem)
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
  },
  hospitalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingStatus: {
    backgroundColor: '#fefcbf',
    color: '#975a16',
  },
  rejectedStatus: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
  },
  hospitalDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },
  viewDocumentButton: {
    backgroundColor: '#e2e8f0',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  viewDocumentButtonText: {
    color: '#4a5568',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: '#48bb78',
  },
  rejectButton: {
    backgroundColor: '#e53e3e',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
}); 