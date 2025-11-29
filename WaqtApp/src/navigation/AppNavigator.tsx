import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootNavigator, navTheme } from '@/navigation/RootNavigator';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { usePrayerSettingsStore } from '@/store/usePrayerSettingsStore';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Use a safer approach to check for hydration
    try {
      // Check if store has already hydrated
      if (usePrayerSettingsStore.persist && typeof usePrayerSettingsStore.persist.hasHydrated === 'function') {
        if (usePrayerSettingsStore.persist.hasHydrated()) {
          setHydrated(true);
          return;
        }
      }
    } catch (e) {
      console.log('Error checking hydration status:', e);
    }

    // Subscribe to hydration finished event
    let unsubscribe: (() => void) | undefined;
    try {
      if (usePrayerSettingsStore.persist && typeof usePrayerSettingsStore.persist.onFinishHydration === 'function') {
        unsubscribe = usePrayerSettingsStore.persist.onFinishHydration(() => {
          setHydrated(true);
        });
      } else {
        // If persist methods are not available, assume hydrated
        setHydrated(true);
      }
    } catch (e) {
      console.log('Error subscribing to hydration:', e);
      // If there's an error, assume hydrated to prevent infinite loading
      setHydrated(true);
    }

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const hasCompletedOnboarding = usePrayerSettingsStore(
    state => state.hasCompletedOnboarding,
  );

  if (!hydrated) {
    return null;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {hasCompletedOnboarding ? (
          <Stack.Screen name="MainTabs" component={RootNavigator} />
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};