import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import type { RootStackScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import type { BloodType, Location as LocationType } from '../types';
import BloodTypeSelector from '../components/BloodTypeSelector';

export default function DonorProfileSetupScreen() {
  const navigation = useNavigation<RootStackScreenProps<'DonorProfileSetup'>['navigation']>();
  const { user, updateUserData } = useAuth();
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        geohash: '', // Will be set by Cloud Function
      });
    } else {
      Alert.alert('Location Required', 'Please enable location access to continue.');
    }
  };

  const handleSubmit = async () => {
    if (!bloodType) {
      Alert.alert('Error', 'Please select your blood type');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please update your location');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserData({
        bloodType,
        location,
        isAvailable: true,
        totalDonations: 0,
      });
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Help us match you with emergency blood requests in your area
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Blood Type</Text>
          <BloodTypeSelector
            selectedType={bloodType}
            onSelect={setBloodType}
            disabled={isSubmitting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={requestLocationPermission}
            disabled={isSubmitting}
          >
            <Text style={styles.locationButtonText}>
              {location ? 'Update Location' : 'Set Location'}
            </Text>
          </TouchableOpacity>
          {location && (
            <Text style={styles.locationText}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Complete Setup</Text>
          )}
        </TouchableOpacity>
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
    flex: 1,
    padding: 20,
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
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  locationButton: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '500',
  },
  locationText: {
    marginTop: 8,
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#e53e3e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 