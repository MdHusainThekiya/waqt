import Geolocation, {
  GeoPosition,
} from 'react-native-geolocation-service';
import { Platform } from 'react-native';
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';

import type { UserLocation } from '@/types/prayer';

const platformPermission = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
});

export const ensureLocationPermission = async () => {
  if (!platformPermission) {
    return false;
  }

  const status = await check(platformPermission);

  if (status === RESULTS.GRANTED) {
    return true;
  }

  if (status === RESULTS.BLOCKED) {
    return false;
  }

  const requested = await request(platformPermission);
  return requested === RESULTS.GRANTED;
};

export const getCurrentLocation = async (): Promise<UserLocation> => {
  const granted = await ensureLocationPermission();
  if (!granted) {
    throw new Error('Location permission is required to calculate prayer times.');
  }

  const position: GeoPosition = await new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
        showLocationDialog: true,
      },
    );
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    label: 'Current Location',
  };
};

