import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import type { BloodType, EmergencyRequest } from '../types';
import BloodTypeSelector from './BloodTypeSelector';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface EmergencyRequestFormProps {
  hospitalId: string;
  onSubmit?: (request: EmergencyRequest) => void;
}

export default function EmergencyRequestForm({
  hospitalId,
  onSubmit,
}: EmergencyRequestFormProps) {
  const navigation = useNavigation<RootStackScreenProps<'Emergency'>['navigation']>();
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [units, setUnits] = useState('');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!bloodType) {
      Alert.alert('Error', 'Please select a blood type');
      return;
    }

    if (!units || isNaN(Number(units)) || Number(units) < 1) {
      Alert.alert('Error', 'Please enter a valid number of units');
      return;
    }

    setIsSubmitting(true);

    try {
      const request: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt'> = {
        hospitalId,
        bloodType,
        units: Number(units),
        urgency,
        status: 'PENDING',
        matchedDonors: [],
        smsStatus: 'PENDING',
        location: {
          geohash: '', // Will be set by Cloud Function
          latitude: 0, // Will be set by Cloud Function
          longitude: 0, // Will be set by Cloud Function
        },
      };

      const docRef = await firestore()
        .collection('emergencies')
        .add({
          ...request,
          createdAt: firestore.Timestamp.now(),
          updatedAt: firestore.Timestamp.now(),
        });

      const newRequest = {
        ...request,
        id: docRef.id,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
      } as EmergencyRequest;

      onSubmit?.(newRequest);
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit emergency request. Please try again.'
      );
      console.error('Emergency request submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Blood Type Required</Text>
        <BloodTypeSelector
          selectedType={bloodType}
          onSelect={setBloodType}
          disabled={isSubmitting}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Number of Units</Text>
        <TextInput
          style={styles.input}
          value={units}
          onChangeText={setUnits}
          keyboardType="number-pad"
          placeholder="Enter number of units needed"
          editable={!isSubmitting}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Urgency Level</Text>
        <View style={styles.urgencyContainer}>
          {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.urgencyButton,
                urgency === level && styles.urgencyButtonSelected,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={() => setUrgency(level)}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.urgencyButtonText,
                  urgency === level && styles.urgencyButtonTextSelected,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any additional information..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isSubmitting}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Emergency Request'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
  notesInput: {
    height: 100,
  },
  urgencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  urgencyButtonSelected: {
    backgroundColor: '#e53e3e',
    borderColor: '#e53e3e',
  },
  urgencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
  },
  urgencyButtonTextSelected: {
    color: '#ffffff',
  },
  submitButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    alignItems: 'center',
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