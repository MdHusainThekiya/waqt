import { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';

import { AppNavigator } from '@/navigation/AppNavigator';
import {
  initializeForegroundMessaging,
  registerRemoteChannel,
  requestRemoteMessagingPermission,
} from '@/services/notifications/remoteMessaging';

enableScreens();

function App() {
  useEffect(() => {
    const unsubscribe = initializeForegroundMessaging();
    (async () => {
      await registerRemoteChannel();
      await requestRemoteMessagingPermission();
    })();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

export default App;
