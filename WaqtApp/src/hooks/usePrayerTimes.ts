import { useCallback, useEffect, useState } from 'react';

import { calculatePrayerSchedule, determineNextPrayer } from '@/services/prayerTimes';
import { schedulePrayerNotifications } from '@/services/notifications/localNotifications';
import type { PrayerScheduleItem } from '@/types/prayer';
import { usePrayerSettingsStore } from '@/store/usePrayerSettingsStore';

export const usePrayerTimes = () => {
  const location = usePrayerSettingsStore(state => state.location);
  const offsets = usePrayerSettingsStore(state => state.prayerOffsets);
  const juristicMethod = usePrayerSettingsStore(state => state.juristicMethod);
  const calculationMethod = usePrayerSettingsStore(
    state => state.calculationMethod,
  );

  const [schedule, setSchedule] = useState<PrayerScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const recompute = useCallback(async () => {
    if (!location) {
      return;
    }

    setLoading(true);
    const nextSchedule = calculatePrayerSchedule({
      location,
      offsets,
      juristicMethod,
      calculationMethod,
    });
    setSchedule(nextSchedule);

    try {
      await schedulePrayerNotifications(nextSchedule);
    } catch (error) {
      console.warn('Failed to schedule notifications', error);
    } finally {
      setLoading(false);
    }
  }, [location, offsets, juristicMethod, calculationMethod]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  const nextPrayer = determineNextPrayer(schedule);

  return {
    schedule,
    nextPrayer,
    loading,
    refresh: recompute,
  };
};

