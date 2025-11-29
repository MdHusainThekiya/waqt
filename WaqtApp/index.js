import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

import App from './App';
import { name as appName } from './app.json';
import { rehydratePrayerNotifications } from './src/services/notifications/localNotifications';
import { getPrayerSettingsState } from './src/store/usePrayerSettingsStore';

const messagingInstance = getMessaging(getApp());

setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  if (!remoteMessage?.notification) {
    return;
  }

  await notifee.displayNotification({
    title: remoteMessage.notification.title,
    body: remoteMessage.notification.body,
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
});

notifee.onBackgroundEvent(async ({ type }) => {
  if (
    type === EventType.ACTION_PRESS ||
    type === EventType.PRESS ||
    type === EventType.DISMISSED
  ) {
    await rehydratePrayerNotifications(getPrayerSettingsState());
  }
});

AppRegistry.registerComponent(appName, () => App);
