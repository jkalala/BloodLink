import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type RouteProps = RootStackScreenProps<'PhoneAuth'>['route'];

export default function PhoneAuthScreen() {
  const navigation = useNavigation<RootStackScreenProps<'PhoneAuth'>['navigation']>();
  const route = useRoute<RouteProps>();
  const { userType } = route.params;
  const { signIn } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(phoneNumber);
      setIsVerifying(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      // Verify code and sign in
      // After successful verification, navigate to appropriate profile setup
      navigation.replace(
        userType === 'donor' ? 'DonorProfileSetup' : 'HospitalProfileSetup'
      );
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Verification</Text>
      <Text style={styles.subtitle}>
        {userType === 'donor' 
          ? 'Verify your phone number to start donating blood'
          : 'Verify your phone number to manage blood requests'}
      </Text>

      {!isVerifying ? (
        <>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.disabledButton]}
            onPress={handleSendCode}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Sending...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter verification code"
            keyboardType="number-pad"
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.disabledButton]}
            onPress={handleVerifyCode}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f7fafc',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#e53e3e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 