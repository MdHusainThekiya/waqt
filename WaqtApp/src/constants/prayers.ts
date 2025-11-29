import type { PrayerIdentifier } from '@/types/prayer';

export const PRAYER_SEQUENCE: PrayerIdentifier[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export const PRAYER_LABELS: Record<
  PrayerIdentifier,
  { title: string; description: string }
> = {
  fajr: {
    title: 'Fajar',
    description: 'Pre-dawn serenity anchored in reflection.',
  },
  dhuhr: {
    title: 'Zuhr',
    description: 'Midday pause that recenters intention.',
  },
  asr: {
    title: 'Asr',
    description: 'Afternoon focus that keeps momentum grounded.',
  },
  maghrib: {
    title: 'Maghrib',
    description: 'Sunset gratitude embracing transition.',
  },
  isha: {
    title: 'Isha',
    description: 'Night-time calm to close the day with dhikr.',
  },
};

export const DEFAULT_PRAYER_OFFSETS: Record<PrayerIdentifier, number> = {
  fajr: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

