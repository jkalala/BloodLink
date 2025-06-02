import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { firebaseFirestore } from '../config/firebase';
import type { NetInfoState } from '@react-native-community/netinfo';

interface OfflineStorageOptions<T> {
  key: string;
  initialData?: T;
  syncOnConnect?: boolean;
}

export function useOfflineStorage<T>({
  key,
  initialData,
  syncOnConnect = true,
}: OfflineStorageOptions<T>) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load data from AsyncStorage
  const loadData = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(key);
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Save data to AsyncStorage
  const saveData = useCallback(async (newData: T) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save data'));
    }
  }, [key]);

  // Sync with Firestore when online
  const syncWithFirestore = useCallback(async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;

    try {
      // Example sync logic - modify based on your data structure
      const docRef = firebaseFirestore.collection('offlineData').doc(key);
      const doc = await docRef.get();

      if (doc.exists) {
        const serverData = doc.data() as T;
        await saveData(serverData);
      } else if (data) {
        // If we have local data but no server data, save to server
        await docRef.set(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sync with server'));
    }
  }, [key, data, saveData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Monitor network connectivity
  useEffect(() => {
    if (!syncOnConnect) return;

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected === true) {
        syncWithFirestore();
      }
    });

    return () => unsubscribe();
  }, [syncOnConnect, syncWithFirestore]);

  return {
    data,
    isLoading,
    error,
    saveData,
    syncWithFirestore,
    refresh: loadData,
  };
} 