import notifee, {
  AndroidImportance,
  AndroidVisibility,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import dayjs from 'dayjs';

import { NOTIF_CHANNEL_ID, NOTIF_SOUND_NAME } from '@/constants/app';
import type { PrayerScheduleItem } from '@/types/prayer';
import { calculatePrayerSchedule } from '@/services/prayerTimes';
import { getPrayerSettingsState } from '@/store/usePrayerSettingsStore';

const buildPrayerBody = (item: PrayerScheduleItem) =>
  item.id === 'maghrib'
    ? 'Maghrib reminder right on Azan. Time to pause and pray.'
    : '15-minute heads up so you can wrap up calmly before the Azan.';

const resolveTriggerTimestamp = (item: PrayerScheduleItem) =>
  item.id === 'maghrib'
    ? item.adjusted.valueOf()
    : item.adjusted.subtract(15, 'minute').valueOf();

export const ensurePrayerChannel = async () => {
  await notifee.createChannel({
    id: NOTIF_CHANNEL_ID,
    name: 'Prayer Alerts',
    lights: true,
    vibration: true,
    sound: NOTIF_SOUND_NAME,
    lightColor: '#FFFFFF',
    vibrationPattern: [200, 120, 200, 120],
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC
  });
};

export const schedulePrayerNotifications = async (
  schedule: PrayerScheduleItem[],
) => {
  await ensurePrayerChannel();
  await notifee.cancelTriggerNotifications();

  const now = dayjs();
  const triggerPromises = schedule
    .map(item => {
      const timestamp = resolveTriggerTimestamp(item);
      if (timestamp <= now.valueOf()) {
        return null;
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp,
        alarmManager: {
          allowWhileIdle: true,
        },
      };

      return notifee.createTriggerNotification(
        {
          id: `prayer-${item.id}-${item.adjusted.format('YYYY-MM-DD')}`,
          title: `${item.label} ${item.id === 'maghrib' ? 'Azan' : 'Reminder'}`,
          body: buildPrayerBody(item),
          android: {
            channelId: NOTIF_CHANNEL_ID,
            sound: NOTIF_SOUND_NAME,
            pressAction: { id: 'default' },
            smallIcon: 'ic_stat_notification',
            showTimestamp: true,
            vibrationPattern: [200, 120, 200, 120],
            importance: AndroidImportance.HIGH,
          },
        },
        trigger,
      );
    })
    .filter(Boolean);

  await Promise.all(triggerPromises as Promise<string>[]);
};

import type { PrayerSettingsState } from '@/store/usePrayerSettingsStore';

export const rehydratePrayerNotifications = async (state: PrayerSettingsState) => {
  if (!state?.location) {
    return;
  }

  const todaySchedule = calculatePrayerSchedule({
    location: state.location,
    offsets: state.prayerOffsets,
    juristicMethod: state.juristicMethod,
    calculationMethod: state.calculationMethod,
    forDate: new Date(),
  });

  const tomorrow = dayjs().add(1, 'day').toDate();
  const tomorrowSchedule = calculatePrayerSchedule({
    location: state.location,
    offsets: state.prayerOffsets,
    juristicMethod: state.juristicMethod,
    calculationMethod: state.calculationMethod,
    forDate: tomorrow,
  });

  // Combine schedules
  const fullSchedule = [...todaySchedule, ...tomorrowSchedule];
  
  await schedulePrayerNotifications(fullSchedule);
};

