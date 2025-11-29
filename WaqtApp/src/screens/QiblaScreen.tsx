import { StyleSheet, Text, View } from 'react-native';

import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { QiblaCompass } from '@/components/QiblaCompass';
import { palette } from '@/theme/colors';
import { usePrayerSettingsStore } from '@/store/usePrayerSettingsStore';
import { calculateQibla } from '@/services/prayerTimes';
import { useCompass } from '@/hooks/useCompass';

export const QiblaScreen = () => {
  const location = usePrayerSettingsStore(state => state.location);
  const qiblaDirection = calculateQibla(location);
  const currentHeading = useCompass();

  return (
    <GradientBackground>
      <Text style={styles.heading}>Qibla Finder</Text>
      <Text style={styles.subtitle}>
        Rotate your device to align the arrow with the Kaaba icon
      </Text>

      <GlassCard style={styles.card}>
        <QiblaCompass
          qiblaDirection={qiblaDirection}
          currentHeading={currentHeading}
        />
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Your Heading</Text>
            <Text style={styles.infoValue}>{Math.round(currentHeading)}°</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Qibla</Text>
            <Text style={styles.infoValue}>{Math.round(qiblaDirection)}°</Text>
          </View>
        </View>
      </GlassCard>

      <Text style={styles.hint}>
        💡 Hold device flat. Calibrate by moving in a figure-8 pattern if needed
      </Text>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  heading: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.muted,
    marginTop: 6,
    marginBottom: 20,
    fontSize: 13,
  },
  card: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 40,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: palette.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '600',
  },
  hint: {
    color: palette.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});
