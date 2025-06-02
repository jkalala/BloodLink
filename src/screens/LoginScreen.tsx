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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation<RootStackScreenProps<'Login'>['navigation']>();
  const { signIn } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
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
      navigation.navigate('PhoneAuth' as never);
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
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to continue
          </Text>
        </View>

        <View style={styles.form}>
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
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register' as never)}
              disabled={isSubmitting}
            >
              <Text style={styles.footerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: 24,
  },
  header: {
    marginTop: 48,
    marginBottom: 48,
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