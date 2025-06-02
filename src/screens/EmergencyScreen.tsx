import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { firebaseFirestore } from '../config/firebase';
import type { EmergencyRequest } from '../types';
import EmergencyRequestForm from '../components/EmergencyRequestForm';

export default function EmergencyScreen() {
  const navigation = useNavigation<RootStackScreenProps<'Emergency'>['navigation']>();
  const { user, userType, userData } = useAuth();
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchEmergencies = async () => {
    try {
      let query;
      if (userType === 'donor') {
        // For donors, show emergencies matching their blood type
        const donorData = userData as { bloodType: string };
        query = firebaseFirestore
          .collection('emergencies')
          .where('bloodType', '==', donorData.bloodType)
          .where('status', '==', 'ACTIVE')
          .orderBy('createdAt', 'desc');
      } else {
        // For hospitals, show their own emergencies
        query = firebaseFirestore
          .collection('emergencies')
          .where('hospitalId', '==', user?.uid)
          .orderBy('createdAt', 'desc');
      }

      return query.onSnapshot(
        (snapshot) => {
          const emergencyList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as EmergencyRequest[];
          setEmergencies(emergencyList);
          setIsLoading(false);
          setIsRefreshing(false);
        },
        (error) => {
          console.error('Error fetching emergencies:', error);
          Alert.alert('Error', 'Failed to load emergency requests');
          setIsLoading(false);
          setIsRefreshing(false);
        }
      );
    } catch (error) {
      console.error('Error setting up emergencies listener:', error);
      Alert.alert('Error', 'Failed to load emergency requests');
      setIsLoading(false);
      setIsRefreshing(false);
      return () => {};
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      unsubscribe = await fetchEmergencies();
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userType, userData, user?.uid]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEmergencies();
  };

  const handleSubmitSuccess = () => {
    setShowForm(false);
    handleRefresh();
  };

  const renderEmergencyItem = (emergency: EmergencyRequest) => (
    <View
      key={emergency.id}
      style={[
        styles.emergencyItem,
        emergency.urgency === 'CRITICAL' && styles.criticalEmergency,
      ]}
    >
      <View style={styles.emergencyHeader}>
        <Text style={styles.bloodType}>{emergency.bloodType}</Text>
        <Text
          style={[
            styles.urgency,
            emergency.urgency === 'CRITICAL' && styles.criticalUrgency,
          ]}
        >
          {emergency.urgency}
        </Text>
      </View>
      <Text style={styles.units}>Units needed: {emergency.units}</Text>
      <Text style={styles.description}>No additional notes</Text>
      <View style={styles.footer}>
        <Text style={styles.hospital}>
          {userType === 'donor' ? 'Hospital' : 'Your Hospital'}
        </Text>
        <Text style={styles.time}>
          {new Date(emergency.createdAt.toDate()).toLocaleString()}
        </Text>
      </View>
      {userType === 'hospital' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              emergency.status === 'ACTIVE'
                ? styles.deactivateButton
                : styles.activateButton,
            ]}
            onPress={() => {
              // TODO: Implement status toggle
              Alert.alert('Coming soon', 'This feature will be available soon');
            }}
          >
            <Text style={styles.actionButtonText}>
              {emergency.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {userType === 'hospital' && !showForm && (
          <TouchableOpacity
            style={styles.newRequestButton}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.newRequestButtonText}>New Emergency Request</Text>
          </TouchableOpacity>
        )}

        {showForm ? (
          <EmergencyRequestForm
            hospitalId={user?.uid || ''}
            onSubmit={(request) => {
              handleSubmitSuccess();
            }}
          />
        ) : (
          <>
            <Text style={styles.title}>
              {userType === 'donor'
                ? 'Blood Requests Near You'
                : 'Your Emergency Requests'}
            </Text>
            {emergencies.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {userType === 'donor'
                    ? 'No blood requests matching your blood type at the moment'
                    : 'You have no emergency requests yet'}
                </Text>
              </View>
            ) : (
              emergencies.map(renderEmergencyItem)
            )}
          </>
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
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
  },
  newRequestButton: {
    backgroundColor: '#e53e3e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  newRequestButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyItem: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  criticalEmergency: {
    borderColor: '#e53e3e',
    backgroundColor: '#fff5f5',
  },
  emergencyHeader: {
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
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    backgroundColor: '#edf2f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  criticalUrgency: {
    color: '#ffffff',
    backgroundColor: '#e53e3e',
  },
  units: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hospital: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
  },
  time: {
    fontSize: 12,
    color: '#718096',
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deactivateButton: {
    backgroundColor: '#e2e8f0',
  },
  activateButton: {
    backgroundColor: '#48bb78',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
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