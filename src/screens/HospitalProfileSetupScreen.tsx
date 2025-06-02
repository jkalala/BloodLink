import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import type { RootStackScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import type { Location as LocationType } from '../types';

export default function HospitalProfileSetupScreen() {
  const navigation = useNavigation<RootStackScreenProps<'HospitalProfileSetup'>['navigation']>();
  const { updateUserData } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
  });
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
    if (!formData.name || !formData.code || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please update your location');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserData({
        name: formData.name,
        code: formData.code.toUpperCase(),
        email: formData.email.toLowerCase(),
        location,
        isVerified: false, // Will be verified by admin
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
          Set up your hospital profile to start managing blood requests
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Hospital Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Enter hospital name"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Hospital Code</Text>
          <TextInput
            style={styles.input}
            value={formData.code}
            onChangeText={(text) => setFormData(prev => ({ ...prev, code: text.toUpperCase() }))}
            placeholder="Enter hospital code (e.g., HGL-001)"
            autoCapitalize="characters"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text.toLowerCase() }))}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2d3748',
    backgroundColor: '#f7fafc',
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