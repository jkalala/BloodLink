import React, { createContext, useContext, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { Donor, Hospital } from '../types';

type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  userType: 'donor' | 'hospital' | null;
  userData: Donor | Hospital | null;
  signIn: (phoneNumber: string) => Promise<FirebaseAuthTypes.ConfirmationResult>;
  signOut: () => Promise<void>;
  updateUserData: (data: Partial<Donor | Hospital>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userType, setUserType] = useState<'donor' | 'hospital' | null>(null);
  const [userData, setUserData] = useState<Donor | Hospital | null>(null);

  const signIn = async (phoneNumber: string) => {
    try {
      return await auth().signInWithPhoneNumber(phoneNumber);
    } catch (error) {
      console.error('Phone auth error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUserData = async (data: Partial<Donor | Hospital>) => {
    if (!user || !userType) throw new Error('No user logged in');
    const collection = userType === 'donor' ? 'donors' : 'hospitals';
    await firestore().collection(collection).doc(user.uid).update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    setUserData(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, userType, userData, signIn, signOut, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 