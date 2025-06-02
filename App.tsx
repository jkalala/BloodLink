import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Import screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserTypeSelectionScreen from './src/screens/UserTypeSelectionScreen';
import PhoneAuthScreen from './src/screens/PhoneAuthScreen';
import DonorProfileSetupScreen from './src/screens/DonorProfileSetupScreen';
import HospitalProfileSetupScreen from './src/screens/HospitalProfileSetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminNavigator from './src/navigation/AdminNavigator';

// Import types
import { RootStackParamList } from './src/types/navigation';

// Create the navigation stack
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const colorScheme = useColorScheme();

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type:', state.type);
      console.log('Is connected?', state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#1a202c' : '#ffffff',
            },
            headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="UserTypeSelection" 
            component={UserTypeSelectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PhoneAuth" 
            component={PhoneAuthScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DonorProfileSetup" 
            component={DonorProfileSetupScreen}
            options={{ title: 'Donor Profile' }}
          />
          <Stack.Screen 
            name="HospitalProfileSetup" 
            component={HospitalProfileSetupScreen}
            options={{ title: 'Hospital Profile' }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Emergency" 
            component={EmergencyScreen}
            options={{ title: 'Emergency Request' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'My Profile' }}
          />
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
} 