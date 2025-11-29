import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import dayjs from 'dayjs';

import { NOTIF_CHANNEL_ID, NOTIF_SOUND_NAME } from '@/constants/app';

/**
 * Test utility functions for verifying notification functionality
 */

/**
 * Check if notification permissions are granted
 */
export const checkNotificationPermissions = async (): Promise<boolean> => {
  try {
    const settings = await notifee.getNotificationSettings();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Failed to check notification permissions', error);
    return false;
  }
};

/**
 * Send an immediate test notification
 */
export const sendTestNotification = async (): Promise<void> => {
  try {
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }

    await notifee.displayNotification({
      title: '🧪 Test Notification',
      body: 'If you see this, notifications are working!',
      android: {
        channelId: NOTIF_CHANNEL_ID,
        sound: NOTIF_SOUND_NAME,
        pressAction: { id: 'default' },
        smallIcon: 'ic_notification',
        showTimestamp: true,
        vibrationPattern: [200, 120, 200, 120],
        importance: AndroidImportance.HIGH,
      },
    });

    console.log('✅ Test notification sent successfully');
  } catch (error) {
    console.error('❌ Failed to send test notification', error);
    throw error;
  }
};

/**
 * Schedule a test notification 10 seconds from now
 */
export const scheduleTestNotification = async (seconds: number = 10): Promise<void> => {
  try {
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: dayjs().add(seconds, 'second').valueOf(),
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee.createTriggerNotification(
      {
        id: 'test-notification',
        title: '⏰ Scheduled Test Notification',
        body: `This notification was scheduled ${seconds} seconds ago`,
        android: {
          channelId: NOTIF_CHANNEL_ID,
          sound: NOTIF_SOUND_NAME,
          pressAction: { id: 'default' },
          smallIcon: 'ic_notification',
          showTimestamp: true,
          vibrationPattern: [200, 120, 200, 120],
          importance: AndroidImportance.HIGH,
        },
      },
      trigger,
    );

    console.log(`✅ Test notification scheduled for ${seconds} seconds from now`);
  } catch (error) {
    console.error('❌ Failed to schedule test notification', error);
    throw error;
  }
};

/**
 * Get all scheduled trigger notifications
 */
export const getScheduledNotifications = async () => {
  try {
    const notifications = await notifee.getTriggerNotifications();
    console.log(`📋 Found ${notifications.length} scheduled notifications:`);
    notifications.forEach(notif => {
      if (notif.trigger && 'timestamp' in notif.trigger) {
        const trigger = notif.trigger as TimestampTrigger;
        const triggerTime = dayjs(trigger.timestamp);
        const timeUntil = triggerTime.diff(dayjs(), 'minute');
        console.log(
          `  - ${notif.notification.title} (ID: ${notif.notification.id}) - In ${timeUntil} minutes`,
        );
      } else {
        console.log(
          `  - ${notif.notification.title} (ID: ${notif.notification.id})`,
        );
      }
    });
    return notifications;
  } catch (error) {
    console.error('❌ Failed to get scheduled notifications', error);
    throw error;
  }
};

/**
 * Cancel all scheduled test notifications
 */
export const cancelTestNotifications = async (): Promise<void> => {
  try {
    await notifee.cancelNotification('test-notification');
    console.log('✅ Test notification cancelled');
  } catch (error) {
    console.error('❌ Failed to cancel test notification', error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications (including prayer notifications)
 */
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  try {
    await notifee.cancelTriggerNotifications();
    console.log('✅ All scheduled notifications cancelled');
  } catch (error) {
    console.error('❌ Failed to cancel all notifications', error);
    throw error;
  }
};

