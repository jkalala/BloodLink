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
import type { BloodType } from '../types';
import BloodTypeSelector from '../components/BloodTypeSelector';
import HospitalVerificationUpload from '../components/HospitalVerificationUpload';

export default function ProfileScreen() {
  const navigation = useNavigation<RootStackScreenProps<'Profile'>['navigation']>();
  const { userType, userData, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState(userData?.location || null);
  const [formData, setFormData] = useState({
    bloodType: (userData as any)?.bloodType || null,
    name: (userData as any)?.name || '',
    code: (userData as any)?.code || '',
    email: (userData as any)?.email || '',
  });

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
    if (!location) {
      Alert.alert('Error', 'Please update your location');
      return;
    }

    if (userType === 'hospital' && (!formData.name || !formData.code || !formData.email)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (userType === 'donor' && !formData.bloodType) {
      Alert.alert('Error', 'Please select your blood type');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = userType === 'donor'
        ? { bloodType: formData.bloodType, location }
        : { name: formData.name, code: formData.code, email: formData.email, location };

      await updateUserData(updateData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDonorProfile = () => (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Phone Number</Text>
        <Text style={styles.value}>{userData?.phone}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Blood Type</Text>
        {isEditing ? (
          <BloodTypeSelector
            selectedType={formData.bloodType as BloodType}
            onSelect={(type) => setFormData(prev => ({ ...prev, bloodType: type }))}
            disabled={isSubmitting}
          />
        ) : (
          <Text style={styles.value}>
            {(userData as any)?.bloodType?.replace('_', '+') || 'Not set'}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Location</Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.locationButton}
            onPress={requestLocationPermission}
            disabled={isSubmitting}
          >
            <Text style={styles.locationButtonText}>
              {location ? 'Update Location' : 'Set Location'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.value}>
            {location
              ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : 'Not set'}
          </Text>
        )}
      </View>

      {isEditing ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setIsEditing(false);
              setFormData({
                bloodType: (userData as any)?.bloodType || null,
                name: (userData as any)?.name || '',
                code: (userData as any)?.code || '',
                email: (userData as any)?.email || '',
              });
              setLocation(userData?.location || null);
            }}
            disabled={isSubmitting}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderHospitalProfile = () => (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Phone Number</Text>
        <Text style={styles.value}>{userData?.phone}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Hospital Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Enter hospital name"
            editable={!isSubmitting}
          />
        ) : (
          <Text style={styles.value}>{(userData as any)?.name || 'Not set'}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Hospital Code</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.code}
            onChangeText={(text) => setFormData(prev => ({ ...prev, code: text.toUpperCase() }))}
            placeholder="Enter hospital code"
            autoCapitalize="characters"
            editable={!isSubmitting}
          />
        ) : (
          <Text style={styles.value}>{(userData as any)?.code || 'Not set'}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text.toLowerCase() }))}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
          />
        ) : (
          <Text style={styles.value}>{(userData as any)?.email || 'Not set'}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Location</Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.locationButton}
            onPress={requestLocationPermission}
            disabled={isSubmitting}
          >
            <Text style={styles.locationButtonText}>
              {location ? 'Update Location' : 'Set Location'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.value}>
            {location
              ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : 'Not set'}
          </Text>
        )}
      </View>

      <HospitalVerificationUpload />

      {isEditing ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setIsEditing(false);
              setFormData({
                bloodType: (userData as any)?.bloodType || null,
                name: (userData as any)?.name || '',
                code: (userData as any)?.code || '',
                email: (userData as any)?.email || '',
              });
              setLocation(userData?.location || null);
            }}
            disabled={isSubmitting}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {userType === 'donor' ? renderDonorProfile() : renderHospitalProfile()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#2d3748',
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
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#e53e3e',
    margin: 16,
  },
  submitButton: {
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
  verifiedText: {
    color: '#2f855a',
    fontWeight: '600',
  },
  unverifiedText: {
    color: '#c53030',
    fontWeight: '600',
  },
}); 