import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { NOTIF_SOUND_NAME } from '@/constants/app';

const messagingInstance = getMessaging(getApp());

export const requestRemoteMessagingPermission = async () => {
  try {
    const authStatus = await requestPermission(messagingInstance, {
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
      announcement: true,
    });

    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return null;
    }

    try {
      return await getToken(messagingInstance);
    } catch (tokenError) {
      console.warn('Failed to obtain FCM token', tokenError);
      return null;
    }
  } catch (error) {
    console.warn('Notification permission request failed', error);
    return null;
  }
};

export const initializeForegroundMessaging = () =>
  onMessage(messagingInstance, async remoteMessage => {
    try {
      if (!remoteMessage?.notification) {
        return;
      }

      await notifee.displayNotification({
        title: remoteMessage.notification.title ?? 'Waqt',
        body: remoteMessage.notification.body ?? 'New broadcast',
        android: {
          channelId: 'waqt_remote_broadcasts',
          sound: NOTIF_SOUND_NAME,
          pressAction: { id: 'default' },
          smallIcon: 'ic_stat_notification',
          showTimestamp: true,
          vibrationPattern: [200, 120, 200, 120],
          importance: AndroidImportance.HIGH,
        },
      });
    } catch (error) {
      console.warn('Failed to display foreground notification', error);
    }
  });

export const registerRemoteChannel = async () => {
  await notifee.createChannel({
    id: 'waqt_remote_broadcasts',
    name: 'System Announcements',
    lights: true,
    vibration: true,
    sound: NOTIF_SOUND_NAME,
    lightColor: '#FFFFFF',
    vibrationPattern: [200, 120, 200, 120],
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC
  });
};

