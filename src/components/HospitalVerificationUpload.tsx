import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import firestore from '@react-native-firebase/firestore';
import storage, { FirebaseStorageTypes } from '@react-native-firebase/storage';
import { useAuth } from '../contexts/AuthContext';

export default function HospitalVerificationUpload() {
  const { userData } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const { uri, mimeType, name } = result.assets[0];
      if (uri && mimeType && name) {
        await uploadDocument(uri, mimeType, name);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const uploadDocument = async (uri: string, mimeType: string, fileName: string) => {
    if (!userData?.id) {
      Alert.alert('Error', 'User data not found');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a reference to the storage location
      const storageRef = storage().ref(`verification/${userData.id}/${fileName}`);

      // Read the file
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Upload the file
      const uploadTask = storageRef.putFile(uri);

      // Monitor upload progress
      uploadTask.on('state_changed', (snapshot: FirebaseStorageTypes.TaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      });

      // Wait for upload to complete
      await uploadTask;

      // Get the download URL
      const downloadUrl = await storageRef.getDownloadURL();

      // Update hospital document with verification info
      await firestore()
        .collection('users')
        .doc(userData.id)
        .update({
          verificationDocument: downloadUrl,
          verificationStatus: 'PENDING',
          verificationSubmittedAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert(
        'Success',
        'Verification document uploaded successfully. Our team will review it shortly.'
      );
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const renderVerificationStatus = () => {
    const status = (userData as any)?.verificationStatus;
    const submittedAt = (userData as any)?.verificationSubmittedAt;

    switch (status) {
      case 'VERIFIED':
        return (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, styles.verifiedText]}>
              ✓ Verified
            </Text>
            <Text style={styles.statusSubtext}>
              Your hospital has been verified
            </Text>
          </View>
        );
      case 'PENDING':
        return (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, styles.pendingText]}>
              ⏳ Pending Review
            </Text>
            <Text style={styles.statusSubtext}>
              Submitted on {submittedAt?.toDate().toLocaleDateString()}
            </Text>
          </View>
        );
      case 'REJECTED':
        return (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, styles.rejectedText]}>
              ✕ Verification Rejected
            </Text>
            <Text style={styles.statusSubtext}>
              Please upload a new document
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, styles.unverifiedText]}>
              ! Not Verified
            </Text>
            <Text style={styles.statusSubtext}>
              Please upload a verification document
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hospital Verification</Text>
      <Text style={styles.subtitle}>
        Upload an official document to verify your hospital's identity
      </Text>

      {renderVerificationStatus()}

      {(!(userData as any)?.verificationStatus || (userData as any)?.verificationStatus === 'REJECTED') && (
        <TouchableOpacity
          style={[styles.uploadButton, isUploading && styles.disabledButton]}
          onPress={pickDocument}
          disabled={isUploading}
        >
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#ffffff" />
              <Text style={styles.uploadingText}>
                Uploading... {Math.round(uploadProgress)}%
              </Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>
              Upload Verification Document
            </Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.infoText}>
        Accepted documents: Hospital license, registration certificate, or any official document proving your hospital's identity.
        Maximum file size: 10MB. Supported formats: PDF, JPG, PNG.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 24,
  },
  statusContainer: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#718096',
  },
  verifiedText: {
    color: '#2f855a',
  },
  pendingText: {
    color: '#ed8936',
  },
  rejectedText: {
    color: '#e53e3e',
  },
  unverifiedText: {
    color: '#4a5568',
  },
  uploadButton: {
    backgroundColor: '#e53e3e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  infoText: {
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
    textAlign: 'center',
  },
}); 