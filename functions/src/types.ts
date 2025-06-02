import { Timestamp } from 'firebase-admin/firestore';

export interface DonorData {
  id: string;
  type: 'donor';
  phone: string;
  bloodType: string;
  isAvailable: boolean;
  lastDonation?: Timestamp;
  lastReminderSent?: Timestamp;
}

export interface EmergencyRequest {
  id: string;
  hospitalId: string;
  bloodType: string;
  units: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  matchedDonors: Array<{
    donorId: string;
    phone: string;
    status: 'NOTIFIED' | 'RESPONDED' | 'SCHEDULED' | 'COMPLETED';
    notifiedAt?: Timestamp;
    respondedAt?: Timestamp;
  }>;
  smsStatus: 'PENDING' | 'SENT' | 'FAILED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HospitalData {
  id: string;
  type: 'hospital';
  name: string;
  code: string;
  email: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
    geohash: string;
  };
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationDocument?: string;
  verificationSubmittedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 