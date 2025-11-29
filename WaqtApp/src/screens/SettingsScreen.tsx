import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { OffsetControl } from '@/components/OffsetControl';
import { palette } from '@/theme/colors';
import {
  PRAYER_LABELS,
  PRAYER_SEQUENCE,
} from '@/constants/prayers';
import { calculationMethodList } from '@/constants/calculations';
import { usePrayerSettingsStore } from '@/store/usePrayerSettingsStore';
import { getCurrentLocation } from '@/services/location';
import {
  sendTestNotification,
  scheduleTestNotification,
  getScheduledNotifications,
  checkNotificationPermissions,
} from '@/services/notifications/testNotifications';
import { Alert } from 'react-native';

export const SettingsScreen = () => {
  const [detecting, setDetecting] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const profile = usePrayerSettingsStore(state => state.profile);
  const setProfile = usePrayerSettingsStore(state => state.setProfile);
  const location = usePrayerSettingsStore(state => state.location);
  const setLocation = usePrayerSettingsStore(state => state.setLocation);
  const juristicMethod = usePrayerSettingsStore(state => state.juristicMethod);
  const setJuristicMethod = usePrayerSettingsStore(
    state => state.setJuristicMethod,
  );
  const calculationMethod = usePrayerSettingsStore(
    state => state.calculationMethod,
  );
  const setCalculationMethod = usePrayerSettingsStore(
    state => state.setCalculationMethod,
  );
  const prayerOffsets = usePrayerSettingsStore(state => state.prayerOffsets);
  const updateOffset = usePrayerSettingsStore(state => state.updateOffset);
  const resetOffsets = usePrayerSettingsStore(state => state.resetOffsets);

  const handleDetectLocation = async () => {
    try {
      setDetecting(true);
      const nextLocation = await getCurrentLocation();
      setLocation(nextLocation);
    } catch (error) {
      console.warn('Location detection failed', error);
    } finally {
      setDetecting(false);
    }
  };

  const handleTestImmediateNotification = async () => {
    try {
      setTestingNotification(true);
      const hasPermission = await checkNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings.',
        );
        return;
      }
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent! Check your notification tray.');
    } catch (error) {
      Alert.alert('Error', `Failed to send notification: ${error}`);
    } finally {
      setTestingNotification(false);
    }
  };

  const handleTestScheduledNotification = async () => {
    try {
      setTestingNotification(true);
      const hasPermission = await checkNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings.',
        );
        return;
      }
      await scheduleTestNotification(10);
      Alert.alert(
        'Scheduled',
        'Test notification scheduled for 10 seconds from now. Keep the app open or in background.',
      );
    } catch (error) {
      Alert.alert('Error', `Failed to schedule notification: ${error}`);
    } finally {
      setTestingNotification(false);
    }
  };

  const handleCheckScheduledNotifications = async () => {
    try {
      const notifications = await getScheduledNotifications();
      if (notifications.length === 0) {
        Alert.alert('No Scheduled Notifications', 'There are no notifications scheduled.');
      } else {
        Alert.alert(
          'Scheduled Notifications',
          `Found ${notifications.length} scheduled notification(s). Check console for details.`,
        );
      }
    } catch (error) {
      Alert.alert('Error', `Failed to check notifications: ${error}`);
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Settings & Personalisation</Text>
        <Text style={styles.subHeading}>
          Tailor reminders, offsets, and calculation preferences.
        </Text>

        <GlassCard style={styles.cardSpacing}>
          <Text style={styles.cardTitle}>Profile</Text>
          <TextInput
            placeholder="Name"
            placeholderTextColor={palette.muted}
            style={styles.input}
            value={profile.name}
            onChangeText={text => setProfile({ name: text })}
          />
          <TextInput
            placeholder="Email (optional)"
            placeholderTextColor={palette.muted}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={profile.email ?? ''}
            onChangeText={text => setProfile({ email: text || undefined })}
          />
        </GlassCard>

        <GlassCard style={styles.cardSpacing}>
          <Text style={styles.cardTitle}>Location & Juristic Method</Text>
          <View style={styles.locationRow}>
            <View>
              <Text style={styles.locationLabel}>{location.label}</Text>
              <Text style={styles.locationCoords}>
                {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
              </Text>
            </View>
            <Pressable
              style={styles.detectButton}
              onPress={handleDetectLocation}
              disabled={detecting}
            >
              {detecting ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={styles.detectText}>Detect</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.juristicRow}>
            {(['STANDARD', 'HANAFI'] as const).map(method => (
              <Pressable
                key={method}
                style={[
                  styles.juristicChip,
                  juristicMethod === method && styles.juristicChipActive,
                ]}
                onPress={() => setJuristicMethod(method)}
              >
                <Text
                  style={[
                    styles.juristicText,
                    juristicMethod === method && styles.juristicTextActive,
                  ]}
                >
                  {method === 'STANDARD' ? 'Standard' : 'Hanafi'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionSubtitle}>Calculation Method</Text>
          {calculationMethodList.map(method => (
            <Pressable
              key={method.id}
              onPress={() => setCalculationMethod(method.id)}
              style={[
                styles.methodRow,
                calculationMethod === method.id && styles.methodRowActive,
              ]}
            >
              <View>
                <Text style={styles.methodTitle}>{method.label}</Text>
                <Text style={styles.methodDescription}>
                  {method.description}
                </Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  calculationMethod === method.id && styles.radioOuterActive,
                ]}
              >
                {calculationMethod === method.id ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
            </Pressable>
          ))}
        </GlassCard>

        <GlassCard>
          <View style={styles.offsetHeader}>
            <Text style={styles.cardTitle}>Prayer Offsets</Text>
            <Pressable onPress={resetOffsets}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          </View>
          {PRAYER_SEQUENCE.map(prayerId => (
            <OffsetControl
              key={prayerId}
              id={prayerId}
              label={PRAYER_LABELS[prayerId].title}
              value={prayerOffsets[prayerId]}
              onChange={updateOffset}
            />
          ))}
          <Text style={styles.smallPrint}>
            These offsets sync with backend and drive Notifee scheduling.
          </Text>
        </GlassCard>

        <GlassCard style={styles.notificationCard}>
          <Text style={styles.cardTitle}>Test Notifications</Text>
          <Text style={styles.sectionSubtitle}>
            Verify that notifications are working correctly
          </Text>

          <Pressable
            style={[
              styles.testButton,
              testingNotification && styles.testButtonDisabled,
            ]}
            onPress={handleTestImmediateNotification}
            disabled={testingNotification}
          >
            {testingNotification ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.testButton,
              styles.testButtonSecondary,
              testingNotification && styles.testButtonDisabled,
            ]}
            onPress={handleTestScheduledNotification}
            disabled={testingNotification}
          >
            {testingNotification ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.testButtonText}>
                Schedule Test (10 seconds)
              </Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.testButton, styles.testButtonTertiary]}
            onPress={handleCheckScheduledNotifications}
          >
            <Text style={styles.testButtonText}>
              Check Scheduled Notifications
            </Text>
          </Pressable>

          <Text style={styles.smallPrint}>
            Use these buttons to verify notification permissions and scheduling
            are working correctly.
          </Text>
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },
  heading: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '700',
  },
  subHeading: {
    color: palette.muted,
    marginTop: 6,
    marginBottom: 18,
  },
  cardSpacing: {
    marginBottom: 18,
  },
  cardTitle: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: palette.white,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLabel: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '600',
  },
  locationCoords: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4,
  },
  detectButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
  },
  detectText: {
    color: palette.white,
    fontWeight: '600',
  },
  juristicRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  juristicChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  juristicChipActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: palette.gold,
  },
  juristicText: {
    color: palette.muted,
    fontWeight: '600',
  },
  juristicTextActive: {
    color: palette.white,
  },
  sectionSubtitle: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 18,
    marginBottom: 10,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  methodRowActive: {
    borderBottomColor: palette.gold,
  },
  methodTitle: {
    color: palette.white,
    fontWeight: '600',
  },
  methodDescription: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 2,
    maxWidth: '85%',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: palette.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: palette.gold,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.gold,
  },
  offsetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resetText: {
    color: palette.rose,
    fontWeight: '600',
  },
  smallPrint: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 8,
  },
  testButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButtonSecondary: {
    backgroundColor: 'rgba(255, 213, 128, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 213, 128, 0.4)',
  },
  testButtonTertiary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    color: palette.white,
    fontWeight: '600',
    fontSize: 14,
  },
  notificationCard: {
    marginTop: 18,
  },
});

