import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { PrayerCountdown } from '@/components/PrayerCountdown';
import { PrayerList } from '@/components/PrayerList';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { palette } from '@/theme/colors';
import { usePrayerSettingsStore } from '@/store/usePrayerSettingsStore';

export const HomeScreen = () => {
  const { schedule, nextPrayer, loading, refresh } = usePrayerTimes();
  const profile = usePrayerSettingsStore(state => state.profile);
  const location = usePrayerSettingsStore(state => state.location);

  return (
    <GradientBackground prayerKey={nextPrayer?.id}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={palette.white} />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>
              Assalamualaikum{profile.name ? `, ${profile.name}` : ''}
            </Text>
            <Text style={styles.location}>{location.label}</Text>
          </View>
          <View style={styles.iconAvatar}>
            <Icon name="user" size={20} color={palette.white} />
          </View>
        </View>

        <PrayerCountdown nextPrayer={nextPrayer} />

        <GlassCard style={styles.listCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Prayers</Text>
            <Text style={styles.sectionSubtitle}>Adjusted schedule</Text>
          </View>
          <PrayerList data={schedule} />
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '700',
  },
  location: {
    color: palette.muted,
    marginTop: 4,
  },
  iconAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    marginTop: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: palette.muted,
    fontSize: 13,
  },
});

