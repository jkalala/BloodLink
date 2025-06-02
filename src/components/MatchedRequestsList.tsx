import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import type { EmergencyRequest } from '../types';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import DonationScheduler from './DonationScheduler';

export default function MatchedRequestsList() {
  const navigation = useNavigation<RootStackScreenProps<'Emergency'>['navigation']>();
  const { userData } = useAuth();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);

  const fetchRequests = async () => {
    if (!userData?.id) return;

    try {
      const snapshot = await firestore()
        .collection('emergencies')
        .where('matchedDonors', 'array-contains', userData.id)
        .where('status', 'in', ['PENDING', 'ACTIVE'])
        .orderBy('urgency', 'desc')
        .orderBy('createdAt', 'desc')
        .get();

      const fetchedRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EmergencyRequest[];

      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching matched requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Subscribe to real-time updates
    const unsubscribe = firestore()
      .collection('emergencies')
      .where('matchedDonors', 'array-contains', userData?.id || '')
      .where('status', 'in', ['PENDING', 'ACTIVE'])
      .orderBy('urgency', 'desc')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const updatedRequests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as EmergencyRequest[];
          setRequests(updatedRequests);
        },
        error => {
          console.error('Error in real-time subscription:', error);
        }
      );

    return () => unsubscribe();
  }, [userData?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleRespondToRequest = (request: EmergencyRequest) => {
    setSelectedRequest(request);
    setShowScheduler(true);
  };

  const handleScheduled = () => {
    setShowScheduler(false);
    setSelectedRequest(null);
    fetchRequests(); // Refresh the list
  };

  const handleCancelScheduling = () => {
    setShowScheduler(false);
    setSelectedRequest(null);
  };

  const renderRequest = ({ item }: { item: EmergencyRequest }) => {
    const formatDate = (timestamp: FirebaseFirestoreTypes.Timestamp) => {
      return timestamp.toDate().toLocaleString();
    };

    const getUrgencyColor = (urgency: EmergencyRequest['urgency']) => {
      switch (urgency) {
        case 'CRITICAL':
          return '#e53e3e';
        case 'HIGH':
          return '#ed8936';
        case 'MEDIUM':
          return '#ecc94b';
        case 'LOW':
          return '#48bb78';
        default:
          return '#718096';
      }
    };

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => navigation.navigate('Emergency', { requestId: item.id })}
      >
        <View style={styles.requestHeader}>
          <View style={styles.bloodTypeContainer}>
            <Text style={styles.bloodTypeText}>{item.bloodType}</Text>
          </View>
          <View
            style={[
              styles.urgencyBadge,
              { backgroundColor: getUrgencyColor(item.urgency) },
            ]}
          >
            <Text style={styles.urgencyText}>{item.urgency}</Text>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <Text style={styles.unitsText}>
            {item.units} units needed
          </Text>
          <Text style={styles.hospitalText}>
            Hospital: {item.hospitalId}
          </Text>
          <Text style={styles.timeText}>
            Requested: {formatDate(item.createdAt as unknown as FirebaseFirestoreTypes.Timestamp)}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRespondToRequest(item)}
          >
            <Text style={styles.actionButtonText}>Respond to Request</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e53e3e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matched Emergency Requests</Text>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matched requests at the moment</Text>
            <Text style={styles.emptySubtext}>
              You will be notified when there are emergency requests matching your blood type
            </Text>
          </View>
        }
      />

      <Modal
        visible={showScheduler}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelScheduling}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <DonationScheduler
                emergencyRequest={selectedRequest}
                onScheduled={handleScheduled}
                onCancel={handleCancelScheduling}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    padding: 16,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodTypeContainer: {
    backgroundColor: '#ebf8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bloodTypeText: {
    color: '#2b6cb0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  urgencyText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requestDetails: {
    gap: 8,
    marginBottom: 16,
  },
  unitsText: {
    fontSize: 16,
    color: '#4a5568',
  },
  hospitalText: {
    fontSize: 14,
    color: '#718096',
  },
  timeText: {
    fontSize: 14,
    color: '#a0aec0',
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  actionButton: {
    backgroundColor: '#e53e3e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
}); 