import type { PrayerIdentifier } from '@/types/prayer';

type GradientStop = [string, string];

const gradients: Record<PrayerIdentifier | 'default', GradientStop> = {
  default: ['#0F2027', '#203A43'],
  fajr: ['#141E30', '#355C7D'],
  dhuhr: ['#0F2027', '#2C5364'],
  asr: ['#3E1D6D', '#2A5470'],
  maghrib: ['#2B2D42', '#8E2DE2'],
  isha: ['#141E30', '#243B55'],
};

export const getGradientForPrayer = (
  key?: PrayerIdentifier,
): GradientStop => gradients[key ?? 'default'];

