import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  UserTypeSelection: undefined;
  PhoneAuth: { userType: 'donor' | 'hospital' };
  DonorProfileSetup: undefined;
  HospitalProfileSetup: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Emergency: { requestId?: string };
  Profile: undefined;
  AdminDashboard: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 