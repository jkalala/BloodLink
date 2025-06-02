import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type { BloodType } from '../types';

interface BloodTypeSelectorProps {
  selectedType: BloodType | null;
  onSelect: (type: BloodType) => void;
  disabled?: boolean;
}

const BLOOD_TYPES: BloodType[] = [
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE',
];

export default function BloodTypeSelector({
  selectedType,
  onSelect,
  disabled = false,
}: BloodTypeSelectorProps) {
  const formatBloodType = (type: BloodType) => {
    return type.replace('_', '+');
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {BLOOD_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.bloodTypeButton,
              selectedType === type && styles.selectedButton,
              disabled && styles.disabledButton,
            ]}
            onPress={() => onSelect(type)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{
              selected: selectedType === type,
              disabled,
            }}
            accessibilityLabel={`Blood type ${formatBloodType(type)}`}
          >
            <Text
              style={[
                styles.bloodTypeText,
                selectedType === type && styles.selectedText,
                disabled && styles.disabledText,
              ]}
            >
              {formatBloodType(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  bloodTypeButton: {
    width: '25%',
    padding: 4,
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedButton: {
    backgroundColor: '#e53e3e',
    borderColor: '#e53e3e',
  },
  selectedText: {
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#a0aec0',
  },
}); 