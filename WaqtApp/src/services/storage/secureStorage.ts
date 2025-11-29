import type { StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

const logPrefix = '[secureStorage]';
let useFallbackStorage = false;

const enableFallback = (error: unknown) => {
  if (useFallbackStorage) {
    return;
  }
  useFallbackStorage = true;
  console.warn(
    `${logPrefix} Falling back to AsyncStorage (encrypted storage unavailable).`,
    error,
  );
};

const secureGetItem = async (name: string) => {
  if (useFallbackStorage) {
    return AsyncStorage.getItem(name);
  }
  try {
    const raw = await EncryptedStorage.getItem(name);
    return raw ?? null;
  } catch (error) {
    enableFallback(error);
    return AsyncStorage.getItem(name);
  }
};

const secureSetItem = async (name: string, value: string) => {
  if (useFallbackStorage) {
    return AsyncStorage.setItem(name, value);
  }
  try {
    await EncryptedStorage.setItem(name, value);
  } catch (error) {
    enableFallback(error);
    await AsyncStorage.setItem(name, value);
  }
};

const secureRemoveItem = async (name: string) => {
  if (useFallbackStorage) {
    return AsyncStorage.removeItem(name);
  }
  try {
    await EncryptedStorage.removeItem(name);
  } catch (error) {
    enableFallback(error);
    await AsyncStorage.removeItem(name);
  }
};

export const secureStateStorage: StateStorage = {
  getItem: async name => {
    try {
      return await secureGetItem(name);
    } catch (error) {
      console.warn(`${logPrefix} Failed to read "${name}"`, error);
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await secureSetItem(name, value);
    } catch (error) {
      console.warn(`${logPrefix} Failed to persist "${name}"`, error);
    }
  },
  removeItem: async name => {
    try {
      await secureRemoveItem(name);
    } catch (error) {
      console.warn(`${logPrefix} Failed to delete "${name}"`, error);
    }
  },
};

