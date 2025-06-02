import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { EmergencyRequest, RequestStatus } from '../types';

interface EmergencyRequestActionsProps {
  request: EmergencyRequest;
  onStatusChange?: (newStatus: RequestStatus) => void;
  disabled?: boolean;
}

export default function EmergencyRequestActions({
  request,
  onStatusChange,
  disabled = false,
}: EmergencyRequestActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (isUpdating || disabled) return;

    setIsUpdating(true);
    try {
      await firestore()
        .collection('emergencies')
        .doc(request.id)
        .update({
          status: newStatus,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      onStatusChange?.(newStatus);
    } catch (error) {
      console.error('Error updating request status:', error);
      Alert.alert('Error', 'Failed to update request status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusButton = () => {
    switch (request.status) {
      case 'PENDING':
        return (
          <TouchableOpacity
            style={[styles.button, styles.activateButton]}
            onPress={() => handleStatusChange('ACTIVE')}
            disabled={isUpdating || disabled}
          >
            {isUpdating ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Activate Request</Text>
            )}
          </TouchableOpacity>
        );
      case 'ACTIVE':
        return (
          <TouchableOpacity
            style={[styles.button, styles.deactivateButton]}
            onPress={() => handleStatusChange('PENDING')}
            disabled={isUpdating || disabled}
          >
            {isUpdating ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Deactivate Request</Text>
            )}
          </TouchableOpacity>
        );
      case 'FULFILLED':
        return (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, styles.fulfilledText]}>
              Request Fulfilled
            </Text>
          </View>
        );
      case 'CANCELLED':
        return (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, styles.cancelledText]}>
              Request Cancelled
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const canCancel = request.status === 'PENDING' || request.status === 'ACTIVE';

  return (
    <View style={styles.container}>
      {getStatusButton()}
      {canCancel && (
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            Alert.alert(
              'Cancel Request',
              'Are you sure you want to cancel this request?',
              [
                {
                  text: 'No',
                  style: 'cancel',
                },
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: () => handleStatusChange('CANCELLED'),
                },
              ]
            );
          }}
          disabled={isUpdating || disabled}
        >
          {isUpdating ? (
            <ActivityIndicator color="#e53e3e" />
          ) : (
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Cancel Request
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  activateButton: {
    backgroundColor: '#48bb78',
  },
  deactivateButton: {
    backgroundColor: '#ecc94b',
  },
  cancelButton: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e53e3e',
  },
  cancelButtonText: {
    color: '#e53e3e',
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fulfilledText: {
    color: '#48bb78',
  },
  cancelledText: {
    color: '#e53e3e',
  },
}); 