import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { EmergencyRequest } from '../types';
import EmergencyRequestActions from '../components/EmergencyRequestActions';
import { useAuth } from '../contexts/AuthContext';

export default function EmergencyRequestsScreen() {
  const navigation = useNavigation<RootStackScreenProps<'Emergency'>['navigation']>();
  const { userData } = useAuth();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const snapshot = await firestore()
        .collection('emergencies')
        .where('hospitalId', '==', userData?.id)
        .orderBy('createdAt', 'desc')
        .get();

      const fetchedRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EmergencyRequest[];

      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
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
      .where('hospitalId', '==', userData?.id)
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

  const renderRequest = ({ item }: { item: EmergencyRequest }) => {
    const getStatusColor = (status: EmergencyRequest['status']) => {
      switch (status) {
        case 'PENDING':
          return '#ecc94b';
        case 'ACTIVE':
          return '#48bb78';
        case 'FULFILLED':
          return '#4299e1';
        case 'CANCELLED':
          return '#e53e3e';
        default:
          return '#718096';
      }
    };

    const formatDate = (timestamp: FirebaseFirestoreTypes.Timestamp) => {
      return timestamp.toDate().toLocaleString();
    };

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.bloodTypeContainer}>
            <Text style={styles.bloodTypeText}>{item.bloodType}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <Text style={styles.unitsText}>
            Units needed: {item.units}
          </Text>
          <Text style={styles.urgencyText}>
            Urgency: {item.urgency}
          </Text>
          <Text style={styles.dateText}>
            Created: {formatDate(item.createdAt as unknown as FirebaseFirestoreTypes.Timestamp)}
          </Text>
          {item.updatedAt && (
            <Text style={styles.dateText}>
              Updated: {formatDate(item.updatedAt as unknown as FirebaseFirestoreTypes.Timestamp)}
            </Text>
          )}
        </View>

        <EmergencyRequestActions
          request={item}
          onStatusChange={() => {
            // The real-time subscription will handle the UI update
          }}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4299e1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Requests</Text>
        <TouchableOpacity
          style={styles.newRequestButton}
          onPress={() => navigation.navigate('Emergency', {})}
        >
          <Text style={styles.newRequestButtonText}>New Request</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.emptyText}>No emergency requests yet</Text>
            <Text style={styles.emptySubtext}>
              Create a new request when you need blood urgently
            </Text>
          </View>
        }
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  newRequestButton: {
    backgroundColor: '#4299e1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newRequestButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
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
  urgencyText: {
    fontSize: 16,
    color: '#4a5568',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 14,
    color: '#718096',
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
}); 