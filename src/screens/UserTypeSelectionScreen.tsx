import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UserTypeSelectionScreen() {
  const navigation = useNavigation();

  const handleSelect = (type: 'donor' | 'hospital') => {
    navigation.navigate('PhoneAuth', { userType: type });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who are you?</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#ef4444' }]}
        onPress={() => handleSelect('donor')}
      >
        <Text style={styles.buttonText}>I am a Donor</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2563eb' }]}
        onPress={() => handleSelect('hospital')}
      >
        <Text style={styles.buttonText}>I am a Hospital</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#111827',
  },
  button: {
    width: '100%',
    padding: 18,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 