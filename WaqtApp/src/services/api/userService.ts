import { apiClient } from './apiClient';
import type {
  JuristicMethod,
  PrayerIdentifier,
  UserLocation,
} from '@/types/prayer';

interface CreateUserPayload {
  name: string;
  email?: string;
  location: UserLocation;
}

interface UpdateSettingsPayload {
  juristicMethod?: JuristicMethod;
  prayerOffsets?: Record<PrayerIdentifier, number>;
  location?: UserLocation;
}

interface UserResponse {
  userId: string;
  settings: any;
}

export const userService = {
  createUser: (payload: CreateUserPayload) =>
    apiClient<UserResponse>('/user/create', { body: payload }),

  updateSettings: (userId: string, payload: UpdateSettingsPayload) =>
    apiClient<UserResponse>(`/user/settings?userId=${userId}`, {
      method: 'PUT',
      body: payload,
    }),

  getSettings: (userId: string) =>
    apiClient<any>(`/user/settings?userId=${userId}`),
};
