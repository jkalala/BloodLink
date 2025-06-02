import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type BloodType = 
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE';

export type Locale = 'pt-AO' | 'umb';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RequestStatus = 'PENDING' | 'ACTIVE' | 'FULFILLED' | 'CANCELLED';
export type SMSStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface Location {
  latitude: number;
  longitude: number;
  geohash: string;
}

export interface BaseUser {
  id: string;
  phone: string;
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

export interface Donor {
  id: string;
  phone: string;
  bloodType: BloodType;
  location: Location;
  isAvailable: boolean;
  totalDonations: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hospital extends BaseUser {
  name: string;
  code: string;
  email: string;
  isVerified: boolean;
  isAvailable: boolean;
  verificationDocument?: string;
}

export interface EmergencyRequest {
  id: string;
  hospitalId: string;
  bloodType: BloodType;
  units: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  matchedDonors: string[];
  smsStatus: SMSStatus;
  location: Location;
  notes?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  hospitalId: string;
  emergencyId: string;
  bloodType: BloodType;
  units: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type: 'EMERGENCY' | 'REMINDER' | 'SYSTEM';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export interface UserPreferences {
  id: string;
  userId: string;
  notifications: {
    push: boolean;
    sms: boolean;
  };
  maxDistance: number; // in kilometers
  language: Locale;
  theme: 'light' | 'dark' | 'system';
  updatedAt: FirebaseFirestoreTypes.Timestamp;
} 