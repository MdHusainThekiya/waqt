import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import notifee, {
  AuthorizationStatus,
  NotificationSettings,
} from '@notifee/react-native';

import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { palette } from '@/theme/colors';
import { usePrayerSettingsStore } from '@/store/usePrayerSettingsStore';
import {
  ensureLocationPermission,
  getCurrentLocation,
} from '@/services/location';
import { calculationMethodList } from '@/constants/calculations';
import { DEFAULT_LOCATION } from '@/constants/app';

const isAndroidTiramisuOrAbove =
  Platform.OS === 'android' && Platform.Version >= 33;

const STEPS = [
  { id: 'profile', label: 'Profile' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'location', label: 'Location' },
  { id: 'preferences', label: 'Preferences' },
] as const;

const STEP_INDEX = {
  PROFILE: 0,
  PERMISSIONS: 1,
  LOCATION: 2,
  PREFERENCES: 3,
} as const;

const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const settings: NotificationSettings = await notifee.requestPermission();
    let authorized =
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

    if (Platform.OS === 'android' && Platform.Version < 33) {
      authorized = true;
    } else if (isAndroidTiramisuOrAbove) {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      authorized =
        authorized && status === PermissionsAndroid.RESULTS.GRANTED;
    }

    if (!authorized) {
      Alert.alert(
        'Enable Notifications',
        'Prayer reminders need notification permission. Please allow it to continue.',
      );
    }

    return authorized;
  } catch (error) {
    console.warn('Notification permission request failed', error);
    return false;
  }
};

export const OnboardingScreen = () => {
  const profile = usePrayerSettingsStore(state => state.profile);
  const location = usePrayerSettingsStore(state => state.location);
  const juristicMethod = usePrayerSettingsStore(state => state.juristicMethod);
  const calculationMethod = usePrayerSettingsStore(
    state => state.calculationMethod,
  );

  const setProfile = usePrayerSettingsStore(state => state.setProfile);
  const setLocation = usePrayerSettingsStore(state => state.setLocation);
  const setJuristicMethod = usePrayerSettingsStore(
    state => state.setJuristicMethod,
  );
  const setCalculationMethod = usePrayerSettingsStore(
    state => state.setCalculationMethod,
  );
  const markOnboardingComplete = usePrayerSettingsStore(
    state => state.markOnboardingComplete,
  );

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email ?? '');
  const hasCustomLocation =
    location.latitude !== DEFAULT_LOCATION.latitude ||
    location.longitude !== DEFAULT_LOCATION.longitude ||
    location.label !== DEFAULT_LOCATION.label;

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [requestingNotifications, setRequestingNotifications] =
    useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(hasCustomLocation);
  const [requestingLocationPermission, setRequestingLocationPermission] =
    useState(false);
  const [locationConfirmed, setLocationConfirmed] =
    useState(hasCustomLocation);
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState(String(location.latitude));
  const [manualLng, setManualLng] = useState(String(location.longitude));
  const [manualLabel, setManualLabel] = useState(location.label);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const settings = await notifee.getNotificationSettings();
        if (Platform.OS === 'android' && Platform.Version < 33) {
          setNotificationsGranted(true);
          return;
        }
        const authorized =
          settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
        setNotificationsGranted(authorized);
      } catch (error) {
        console.warn('Unable to read notification settings', error);
      }
    })();
  }, []);

  const detectLocation = useCallback(
    async (options?: { autoConfirm?: boolean }) => {
      try {
        setDetectingLocation(true);
        const granted = await ensureLocationPermission();
        if (!granted) {
          setLocationPermissionGranted(false);
          Alert.alert(
            'Location Required',
            'We need location access to calculate accurate prayer times.',
          );
          return;
        }
        setLocationPermissionGranted(true);
        const nextLocation = await getCurrentLocation();
        setLocation(nextLocation);
        setManualLat(String(nextLocation.latitude));
        setManualLng(String(nextLocation.longitude));
        setManualLabel(nextLocation.label);
        const shouldAutoConfirm = options?.autoConfirm ?? true;
        setLocationConfirmed(shouldAutoConfirm);
        setManualMode(false);
      } catch (error) {
        console.warn('Location detection failed', error);
        Alert.alert(
          'Unable to detect location',
          'Please ensure GPS is enabled and try again.',
        );
      } finally {
        setDetectingLocation(false);
      }
    },
    [setLocation],
  );

  const handleNotificationRequest = useCallback(async () => {
    setRequestingNotifications(true);
    const granted = await requestNotificationPermission();
    setNotificationsGranted(granted);
    setRequestingNotifications(false);
  }, []);

  const handleLocationPermissionRequest = useCallback(async () => {
    setRequestingLocationPermission(true);
    await detectLocation({ autoConfirm: false });
    setRequestingLocationPermission(false);
  }, [detectLocation]);

  const handleLocationRefresh = useCallback(() => {
    detectLocation();
  }, [detectLocation]);

  const handleOpenSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.warn('Unable to open settings', error);
    }
  }, []);

  const profileComplete = useMemo(() => name.trim().length > 0, [name]);
  const locationComplete = useMemo(
    () => locationConfirmed,
    [locationConfirmed],
  );
  const permissionsComplete = useMemo(
    () => notificationsGranted && locationPermissionGranted,
    [locationPermissionGranted, notificationsGranted],
  );
  const canCompleteOnboarding = useMemo(
    () => profileComplete && locationComplete && permissionsComplete,
    [locationComplete, permissionsComplete, profileComplete],
  );
  const isLastStep = currentStep === STEPS.length - 1;
  const isPrimaryDisabled = useMemo(() => {
    switch (currentStep) {
      case STEP_INDEX.PROFILE:
        return !profileComplete;
      case STEP_INDEX.PERMISSIONS:
        return !permissionsComplete;
      case STEP_INDEX.LOCATION:
        return !locationComplete;
      default:
        return !canCompleteOnboarding;
    }
  }, [
    canCompleteOnboarding,
    currentStep,
    locationComplete,
    permissionsComplete,
    profileComplete,
  ]);

  const handleManualSave = useCallback(() => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      Alert.alert(
        'Invalid coordinates',
        'Please enter valid latitude and longitude values.',
      );
      return;
    }
    const label = manualLabel.trim() || 'Manual Location';
    setLocation({
      label,
      latitude: lat,
      longitude: lng,
    });
    setLocationConfirmed(true);
  }, [manualLabel, manualLat, manualLng, setLocation]);

  const handleLocationConfirm = useCallback(() => {
    setLocationConfirmed(true);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!canCompleteOnboarding) {
      return;
    }

    setProfile({ name: name.trim(), email: email.trim() || undefined });
    markOnboardingComplete();
  }, [canCompleteOnboarding, email, markOnboardingComplete, name, setProfile]);

  const handlePrimaryAction = useCallback(() => {
    if (isPrimaryDisabled) {
      return;
    }
    if (isLastStep) {
      handleContinue();
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  }, [handleContinue, isLastStep, isPrimaryDisabled]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const isProfileStep = currentStep === STEP_INDEX.PROFILE;
  const shouldCenterStepper = isProfileStep;
  const showBackButton = currentStep > 0;
  const showSettingsButton =
    !notificationsGranted || !locationPermissionGranted;
  const primaryIconName = isLastStep ? 'check' : 'arrow-right';

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Welcome to Waqt</Text>
        <Text style={styles.subtitle}>
          We’ll personalize your reminders with your profile, location, and
          preferences.
        </Text>

        <View
          style={[
            styles.stepperRow
          ]}
        >
          {STEPS.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.stepperItem
              ]}
            >
              <View style={styles.stepperCircleRow}>
                <View
                  style={[
                    styles.stepCircle,
                    index <= currentStep && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepCircleText,
                      index <= currentStep && styles.stepCircleTextActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                {index < STEPS.length - 1 ? (
                  <View
                    style={[
                      styles.stepConnector,
                      index < currentStep && styles.stepConnectorActive
                    ]}
                  />
                ) : null}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  index <= currentStep && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {currentStep === STEP_INDEX.PROFILE ? (
          <GlassCard style={styles.cardSpacing}>
            <Text style={styles.cardTitle}>Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={palette.muted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor={palette.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </GlassCard>
        ) : null}

        {currentStep === STEP_INDEX.PERMISSIONS ? (
          <GlassCard style={styles.cardSpacing}>
            <Text style={styles.cardTitle}>Permissions</Text>
            <Text style={styles.permissionText}>
              Allow notifications and location so we can personalize reminders
              and keep them reliable offline.
            </Text>
            <Pressable
              style={[
                styles.permissionButton,
                notificationsGranted && styles.permissionButtonSuccess,
                styles.permissionButtonSpacing,
              ]}
              onPress={handleNotificationRequest}
            >
              {requestingNotifications ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={styles.permissionButtonText}>
                  {notificationsGranted
                    ? 'Notifications Enabled'
                    : 'Enable Notifications'}
                </Text>
              )}
            </Pressable>
            <Pressable
              style={[
                styles.permissionButton,
                locationPermissionGranted && styles.permissionButtonSuccess,
              ]}
              onPress={handleLocationPermissionRequest}
            >
              {requestingLocationPermission || detectingLocation ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={styles.permissionButtonText}>
                  {locationPermissionGranted
                    ? 'Location Enabled'
                    : 'Enable Location Access'}
                </Text>
              )}
            </Pressable>
            {showSettingsButton ? (
              <Pressable
                style={[styles.permissionButton, styles.permissionButtonOutline]}
                onPress={handleOpenSettings}
              >
                <Text style={styles.permissionButtonText}>Open Settings</Text>
              </Pressable>
            ) : null}
          </GlassCard>
        ) : null}

        {currentStep === STEP_INDEX.LOCATION ? (
          <GlassCard style={styles.cardSpacing}>
            <Text style={styles.cardTitle}>Location</Text>
            <Text style={styles.helperText}>
              We select your current location after you grant permission. Review
              it below or adjust it manually before confirming.
            </Text>
            <View style={styles.locationRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>{location.label}</Text>
                <Text style={styles.locationCoords}>
                  {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
                </Text>
                <Text
                  style={[
                    styles.locationStatus,
                    locationConfirmed && styles.locationStatusSuccess,
                  ]}
                >
                  {locationConfirmed
                    ? 'Location confirmed'
                    : 'Confirm location to continue'}
                </Text>
              </View>
              <Pressable
                style={styles.detectButton}
                onPress={handleLocationRefresh}
                disabled={detectingLocation}
              >
                {detectingLocation ? (
                  <ActivityIndicator color={palette.white} />
                ) : (
                  <Text style={styles.detectText}>Detect</Text>
                )}
              </Pressable>
            </View>
            <Pressable onPress={() => setManualMode(prev => !prev)}>
              <Text style={styles.manualToggle}>
                {manualMode
                  ? 'Hide manual entry'
                  : "Can't use GPS? Enter coordinates manually"}
              </Text>
            </Pressable>
            {manualMode ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Label (e.g., Mumbai, India)"
                  placeholderTextColor={palette.muted}
                  value={manualLabel}
                  onChangeText={setManualLabel}
                />
                <View style={styles.manualRow}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.manualInput,
                      styles.manualInputSpacing,
                    ]}
                    placeholder="Latitude"
                    placeholderTextColor={palette.muted}
                    keyboardType="decimal-pad"
                    value={manualLat}
                    onChangeText={setManualLat}
                  />
                  <TextInput
                    style={[styles.input, styles.manualInput]}
                    placeholder="Longitude"
                    placeholderTextColor={palette.muted}
                    keyboardType="decimal-pad"
                    value={manualLng}
                    onChangeText={setManualLng}
                  />
                </View>
                <Pressable
                  style={styles.manualSaveButton}
                  onPress={handleManualSave}
                >
                  <Text style={styles.manualSaveText}>Use Manual Location</Text>
                </Pressable>
              </>
            ) : null}

            {!locationConfirmed ? (
              <Pressable
                style={styles.manualSaveButton}
                onPress={handleLocationConfirm}
              >
                <Text style={styles.manualSaveText}>Confirm This Location</Text>
              </Pressable>
            ) : null}
          </GlassCard>
        ) : null}

        {currentStep === STEP_INDEX.PREFERENCES ? (
          <>
            <GlassCard style={styles.cardSpacing}>
              <Text style={styles.cardTitle}>Juristic Method</Text>
              <Text style={styles.helperText}>
                Choose how Asr times are calculated for your madhhab.
              </Text>
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
            </GlassCard>

            <GlassCard style={styles.cardSpacing}>
              <Text style={styles.cardTitle}>Calculation Method</Text>
              {calculationMethodList.map(method => (
                <Pressable
                  key={method.id}
                  onPress={() => setCalculationMethod(method.id)}
                  style={[
                    styles.methodRow,
                    calculationMethod === method.id && styles.methodRowActive,
                  ]}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
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
          </>
        ) : null}

        <View style={styles.footerSpacer} />
      </ScrollView>
      <View style={ showBackButton ? styles.footerContainerWithBackButton : styles.footerContainer}>
        {showBackButton ? (
          <View style={styles.footerGlass}>
            <Pressable
              style={[styles.circleButton, styles.circleButtonSecondary]}
              onPress={handleBack}
              accessibilityLabel="Go to previous step"
            >
              <FeatherIcon name="arrow-left" size={22} color={palette.white} />
            </Pressable>
            <Pressable
              style={[
                styles.circleButton,
                styles.circleButtonPrimary,
                isLastStep && styles.circleButtonCTA,
                isPrimaryDisabled && styles.buttonDisabled,
              ]}
              disabled={isPrimaryDisabled}
              onPress={handlePrimaryAction}
              accessibilityLabel={
                isLastStep ? 'Complete onboarding' : 'Go to next step'
              }
            >
              <FeatherIcon
                name={primaryIconName}
                size={24}
                color={palette.onyx}
              />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[
              styles.circleButton,
              styles.circleButtonPrimary,
              isPrimaryDisabled && styles.buttonDisabled,
              styles.singleActionButton,
            ]}
            disabled={isPrimaryDisabled}
            onPress={handlePrimaryAction}
            accessibilityLabel="Go to next step"
          >
            <FeatherIcon name="arrow-right" size={24} color={palette.onyx} />
          </Pressable>
        )}
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },
  heading: {
    color: palette.white,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.muted,
    marginTop: 6,
    marginBottom: 20,
  },
  cardSpacing: {
    marginBottom: 18,
  },
  cardTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  helperText: {
    color: palette.muted,
    fontSize: 13,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  locationLabel: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '600',
  },
  locationCoords: {
    color: palette.muted,
    marginTop: 4,
    fontSize: 12,
  },
  locationStatus: {
    color: '#F27B50',
    fontSize: 12,
    marginTop: 4,
  },
  locationStatusSuccess: {
    color: '#20C487',
  },
  detectButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  detectText: {
    color: palette.white,
    fontWeight: '600',
  },
  manualToggle: {
    color: palette.gold,
    marginTop: 12,
    fontSize: 13,
  },
  manualRow: {
    flexDirection: 'row',
  },
  manualInput: {
    flex: 1,
  },
  manualInputSpacing: {
    marginRight: 12,
  },
  manualSaveButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  manualSaveText: {
    color: palette.white,
    fontWeight: '600',
  },
  juristicRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  juristicChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
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
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
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
  permissionText: {
    color: palette.muted,
    fontSize: 13,
    marginBottom: 12,
  },
  permissionButton: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  permissionButtonSpacing: {
    marginBottom: 12,
  },
  permissionButtonSuccess: {
    backgroundColor: 'rgba(32, 196, 135, 0.2)',
    borderColor: '#20C487',
    borderWidth: 1,
  },
  permissionButtonOutline: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'transparent',
    marginTop: 12,
  },
  permissionButtonText: {
    color: palette.white,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  footerSpacer: {
    height: 140,
  },
  footerContainerWithBackButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 32,
    backgroundColor: 'rgba(19, 24, 31, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 16,
  },
  circleButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  circleButtonPrimary: {
    backgroundColor: 'rgba(255, 213, 128, 0.9)',
  },
  circleButtonCTA: {
    backgroundColor: '#2FD29C',
  },
  circleButtonSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'transparent',
  },
  circleButtonDisabled: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  singleActionButton: {
    marginTop: 0,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepperRowCentered: {
    alignSelf: 'center',
    width: '80%',
  },
  stepperItem: {
    flex: 1,
  },
  stepperItemCentered: {
    flex: 0,
    width: 80,
    alignItems: 'center',
  },
  stepperCircleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  stepCircleActive: {
    backgroundColor: palette.gold,
    borderColor: palette.gold,
  },
  stepCircleText: {
    color: palette.white,
    fontWeight: '700',
  },
  stepCircleTextActive: {
    color: palette.onyx,
  },
  stepLabel: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: palette.white,
  },
  stepConnector: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  stepConnectorCentered: {
    flex: 0,
    width: 28,
  },
  stepConnectorActive: {
    backgroundColor: palette.gold,
  },
});

