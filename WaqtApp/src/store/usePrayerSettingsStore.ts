import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_LOCATION } from '@/constants/app';
import {
  DEFAULT_PRAYER_OFFSETS,
  PRAYER_SEQUENCE,
} from '@/constants/prayers';
import type {
  CalculationMethodId,
  JuristicMethod,
  PrayerIdentifier,
  PrayerProfile,
  UserLocation,
} from '@/types/prayer';
import { SECURE_STORAGE_KEYS } from '@/constants/app';
import { secureStateStorage } from '@/services/storage/secureStorage';
import { DEFAULT_CALCULATION_METHOD } from '@/constants/calculations';
import { userService } from '@/services/api/userService';
import { rehydratePrayerNotifications } from '@/services/notifications/localNotifications';

type OffsetsState = Record<PrayerIdentifier, number>;

export interface PrayerSettingsState {
  profile: PrayerProfile;
  location: UserLocation;
  juristicMethod: JuristicMethod;
  calculationMethod: CalculationMethodId;
  prayerOffsets: OffsetsState;
  hasCompletedOnboarding: boolean;
  setProfile: (profile: Partial<PrayerProfile>) => void;
  setLocation: (location: UserLocation) => void;
  setJuristicMethod: (method: JuristicMethod) => void;
  setCalculationMethod: (method: CalculationMethodId) => void;
  updateOffset: (id: PrayerIdentifier, minutes: number) => void;
  resetOffsets: () => void;
  markOnboardingComplete: () => Promise<void>;
}

const buildInitialOffsets = (): OffsetsState =>
  PRAYER_SEQUENCE.reduce<OffsetsState>((acc, key) => {
    acc[key] = DEFAULT_PRAYER_OFFSETS[key];
    return acc;
  }, {} as OffsetsState);

export const usePrayerSettingsStore = create<PrayerSettingsState>()(
  persist(
    (set, get) => ({
      profile: { name: '', email: '' },
      location: DEFAULT_LOCATION,
      juristicMethod: 'HANAFI',
      calculationMethod: DEFAULT_CALCULATION_METHOD,
      hasCompletedOnboarding: false,
      prayerOffsets: buildInitialOffsets(),
      setProfile: profile =>
        set(state => ({
          profile: { ...state.profile, ...profile },
        })),
      setLocation: location => {
        set({ location });
        rehydratePrayerNotifications(get());
        const { profile } = get();
        if (profile.userId) {
          userService
            .updateSettings(profile.userId, { location })
            .catch(console.warn);
        }
      },
      setJuristicMethod: method => {
        set({ juristicMethod: method });
        rehydratePrayerNotifications(get());
        const { profile } = get();
        if (profile.userId) {
          userService
            .updateSettings(profile.userId, { juristicMethod: method })
            .catch(console.warn);
        }
      },
      setCalculationMethod: method => {
        set({ calculationMethod: method });
        rehydratePrayerNotifications(get());
      },
      updateOffset: (id, minutes) => {
        set(state => {
          const nextOffsets = { ...state.prayerOffsets, [id]: minutes };
          const { profile } = state;
          if (profile.userId) {
            userService
              .updateSettings(profile.userId, { prayerOffsets: nextOffsets })
              .catch(console.warn);
          }
          return { prayerOffsets: nextOffsets };
        });
        rehydratePrayerNotifications(get());
      },
      resetOffsets: () => {
        const offsets = buildInitialOffsets();
        set({ prayerOffsets: offsets });
        rehydratePrayerNotifications(get());
        const { profile } = get();
        if (profile.userId) {
          userService
            .updateSettings(profile.userId, { prayerOffsets: offsets })
            .catch(console.warn);
        }
      },
      markOnboardingComplete: async () => {
        set({ hasCompletedOnboarding: true });
        rehydratePrayerNotifications(get());
        const { profile, location, juristicMethod, prayerOffsets } = get();
        if (!profile.userId) {
          try {
            const response = await userService.createUser({
              name: profile.name,
              email: profile.email,
              location,
            });
            set(state => ({
              profile: { ...state.profile, userId: response.userId },
            }));
            if (juristicMethod !== 'STANDARD' || Object.values(prayerOffsets).some(v => v !== 0)) {
               await userService.updateSettings(response.userId, {
                 juristicMethod,
                 prayerOffsets
               });
            }
          } catch (error) {
            console.warn('Failed to create user on backend', error);
          }
        }
      },
    }),
    {
      name: SECURE_STORAGE_KEYS.settings,
      storage: createJSONStorage(() => secureStateStorage),
      version: 2,
      migrate: (persistedState: unknown, version) => {
        if (!persistedState) {
          return persistedState;
        }
        if (version < 2) {
          const persisted = persistedState as Partial<PrayerSettingsState>;
          return {
            ...persisted,
            calculationMethod: persisted.calculationMethod ?? DEFAULT_CALCULATION_METHOD,
          };
        }
        return persistedState;
      },
      partialize: state => ({
        profile: state.profile,
        location: state.location,
        juristicMethod: state.juristicMethod,
        calculationMethod: state.calculationMethod,
        prayerOffsets: state.prayerOffsets,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);

export const getPrayerSettingsState = () => usePrayerSettingsStore.getState();

