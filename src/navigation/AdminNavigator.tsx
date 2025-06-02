import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, CommonActions } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import type { RootStackParamList } from '../types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

type AdminNavigatorProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;
};

export default function AdminNavigator({ navigation }: AdminNavigatorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = auth().currentUser;
        if (!user) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          );
          return;
        }

        const idTokenResult = await user.getIdTokenResult();
        const hasAdminClaim = idTokenResult.claims.admin === true;

        if (!hasAdminClaim) {
          navigation.goBack();
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e53e3e" />
      </View>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
}); 