import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type UserType = 'donor' | 'hospital';

export default function RegisterScreen() {
  const navigation = useNavigation<RootStackScreenProps<'Register'>['navigation']>();
  const { signIn } = useAuth();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!userType) {
      Alert.alert('Error', 'Please select your account type');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Format phone number to E.164 format (e.g., +244912345678)
    const formattedNumber = phoneNumber.startsWith('+')
      ? phoneNumber
      : phoneNumber.startsWith('244')
        ? `+${phoneNumber}`
        : `+244${phoneNumber.replace(/^0+/, '')}`;

    setIsSubmitting(true);
    try {
      await signIn(formattedNumber);
      // Pass userType as a parameter to PhoneAuth screen
      navigation.navigate('PhoneAuth', { userType });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send verification code. Please check your phone number and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Select your account type and enter your phone number
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.userTypeContainer}>
              <Text style={styles.label}>I am a:</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'donor' && styles.userTypeButtonSelected,
                  ]}
                  onPress={() => setUserType('donor')}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      userType === 'donor' && styles.userTypeButtonTextSelected,
                    ]}
                  >
                    Blood Donor
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'hospital' && styles.userTypeButtonSelected,
                  ]}
                  onPress={() => setUserType('hospital')}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      userType === 'hospital' && styles.userTypeButtonTextSelected,
                    ]}
                  >
                    Hospital
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+244</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="912345678"
                keyboardType="phone-pad"
                maxLength={9}
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!userType || isSubmitting) && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={!userType || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={isSubmitting}
              >
                <Text style={styles.footerLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
  },
  form: {
    gap: 24,
  },
  userTypeContainer: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
    alignItems: 'center',
  },
  userTypeButtonSelected: {
    backgroundColor: '#e53e3e',
    borderColor: '#e53e3e',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4a5568',
  },
  userTypeButtonTextSelected: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f7fafc',
  },
  prefix: {
    fontSize: 16,
    color: '#4a5568',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    padding: 12,
  },
  button: {
    backgroundColor: '#e53e3e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4a5568',
  },
  footerLink: {
    fontSize: 14,
    color: '#e53e3e',
    fontWeight: '600',
  },
}); 