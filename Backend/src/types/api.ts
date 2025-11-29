export interface PrayerOffsetPayload {
  name: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  offset: number;
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
  label: string;
}

export interface UserSettingsPayload {
  name: string;
  email?: string;
  location: LocationPayload;
  juristicMethod: 'STANDARD' | 'HANAFI';
  prayerOffsets: PrayerOffsetPayload[];
}

