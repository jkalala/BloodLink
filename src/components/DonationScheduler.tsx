import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { EmergencyRequest } from '../types';

interface DonationSchedulerProps {
  emergencyRequest: EmergencyRequest;
  onScheduled?: () => void;
  onCancel?: () => void;
}

export default function DonationScheduler({
  emergencyRequest,
  onScheduled,
  onCancel,
}: DonationSchedulerProps) {
  const { userData } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSchedule = async () => {
    if (!userData?.id) {
      Alert.alert('Error', 'User data not found');
      return;
    }

    // Validate selected date
    const now = new Date();
    if (selectedDate < now) {
      Alert.alert('Error', 'Please select a future date and time');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create donation record
      const donationRef = await firestore().collection('donations').add({
        donorId: userData.id,
        hospitalId: emergencyRequest.hospitalId,
        emergencyId: emergencyRequest.id,
        bloodType: emergencyRequest.bloodType,
        units: 1, // Default to 1 unit per donation
        status: 'SCHEDULED',
        scheduledDate: firestore.Timestamp.fromDate(selectedDate),
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update emergency request
      await firestore()
        .collection('emergencies')
        .doc(emergencyRequest.id)
        .update({
          matchedDonors: firestore.FieldValue.arrayUnion(userData.id),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert(
        'Success',
        'Your donation has been scheduled successfully. You will receive a reminder before your appointment.',
        [{ text: 'OK', onPress: onScheduled }]
      );
    } catch (error) {
      console.error('Error scheduling donation:', error);
      Alert.alert('Error', 'Failed to schedule donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Your Donation</Text>
      <Text style={styles.subtitle}>
        Please select a convenient date and time for your blood donation
      </Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
        disabled={isSubmitting}
      >
        <Text style={styles.dateButtonText}>
          {selectedDate.toLocaleString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.scheduleButton, isSubmitting && styles.disabledButton]}
          onPress={handleSchedule}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Schedule Donation</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>
        Note: Please arrive 15 minutes before your scheduled time. Bring a valid ID and ensure you have eaten a healthy meal before donating.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 24,
  },
  dateButton: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2d3748',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: '#e53e3e',
  },
  cancelButton: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#e53e3e',
  },
  disabledButton: {
    opacity: 0.5,
  },
  infoText: {
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
    textAlign: 'center',
  },
}); 