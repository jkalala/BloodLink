import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function DonorAvailabilityToggle() {
  const { userData } = useAuth();
  const [isAvailable, setIsAvailable] = useState(userData?.isAvailable || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (value: boolean) => {
    if (!userData?.id) {
      Alert.alert('Error', 'User data not found');
      return;
    }

    setIsUpdating(true);
    try {
      await firestore()
        .collection('users')
        .doc(userData.id)
        .update({
          isAvailable: value,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      setIsAvailable(value);
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Failed to update availability status');
      setIsAvailable(!value); // Revert the switch state
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Blood Donation Availability</Text>
          <Text style={styles.subtitle}>
            {isAvailable
              ? 'You are currently available for blood donation'
              : 'You are currently not available for blood donation'}
          </Text>
        </View>
        {isUpdating ? (
          <ActivityIndicator color="#e53e3e" />
        ) : (
          <Switch
            value={isAvailable}
            onValueChange={handleToggle}
            trackColor={{ false: '#e2e8f0', true: '#fc8181' }}
            thumbColor={isAvailable ? '#e53e3e' : '#ffffff'}
          />
        )}
      </View>
      <Text style={styles.infoText}>
        When available, you will be notified of emergency blood requests matching your blood type
        within a 50km radius.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
  },
  infoText: {
    fontSize: 12,
    color: '#a0aec0',
    fontStyle: 'italic',
  },
}); 