import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'android' ? 'http://192.168.0.104:4003/api' : 'http://192.168.0.104:4003/api';
