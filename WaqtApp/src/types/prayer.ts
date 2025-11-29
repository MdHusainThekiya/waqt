import type { Dayjs } from 'dayjs';

export type JuristicMethod = 'STANDARD' | 'HANAFI';
export type CalculationMethodId =
  | 'KARACHI'
  | 'MUSLIM_WORLD_LEAGUE'
  | 'EGYPTIAN'
  | 'UMM_AL_QURA'
  | 'DUBAI';

export type PrayerIdentifier = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerOffset {
  id: PrayerIdentifier;
  minutes: number;
}

export interface PrayerScheduleItem {
  id: PrayerIdentifier;
  label: string;
  azan: Dayjs;
  adjusted: Dayjs;
  offsetMinutes: number;
  order?: number;
}

export interface NextPrayerMeta extends PrayerScheduleItem {
  index: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  label: string;
}

export interface PrayerProfile {
  userId?: string;
  name: string;
  email?: string;
}

