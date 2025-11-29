import { DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen } from '@/screens/HomeScreen';
import { CalendarScreen } from '@/screens/CalendarScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { QiblaScreen } from '@/screens/QiblaScreen';
import { palette } from '@/theme/colors';

const Tab = createBottomTabNavigator();
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 86 : 74;

export const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.onyx,
    card: 'rgba(15,15,20,0.9)',
    text: palette.white,
  },
};

const ICONS: Record<string, string> = {
  Home: 'clock',
  Calendar: 'calendar',
  Qibla: 'compass',
  Settings: 'sliders',
};

export const RootNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomSpacing = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: TAB_BAR_HEIGHT,
          paddingBottom: Platform.OS === 'ios' ? 20 : 14,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 20,
          borderRadius: 28,
        },
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
        tabBarActiveTintColor: palette.gold,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
        },
        tabBarItemStyle: {
          borderRadius: 20,
        },
        tabBarIcon: ({ color, size }) => (
          <Icon
            name={ICONS[route.name] ?? 'circle'}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Qibla" component={QiblaScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 32, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
});

