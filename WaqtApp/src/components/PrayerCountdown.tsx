import type { NextPrayerMeta } from '@/types/prayer';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from './GlassCard';
import { useCountdown } from '@/hooks/useCountdown';
import { palette } from '@/theme/colors';
import { formatPrayerTime } from '@/utils/time';

interface Props {
  nextPrayer: NextPrayerMeta | null;
}

export const PrayerCountdown = ({ nextPrayer }: Props) => {
  const countdown = useCountdown(nextPrayer?.adjusted ?? null);

  return (
    <GlassCard>
      <Text style={styles.label}>Next Prayer</Text>
      <Text style={styles.title}>{nextPrayer?.label ?? 'Loading'}</Text>
      <View style={styles.countdownRow}>
        <Text style={styles.countdown}>{countdown}</Text>
        {nextPrayer?.adjusted ? (
          <Text style={styles.time}>
            {formatPrayerTime(nextPrayer.adjusted)}
          </Text>
        ) : null}
      </View>
      <Text style={styles.caption}>Reminder respects your offset rules</Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  label: {
    color: palette.muted,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  title: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  countdown: {
    color: palette.white,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  time: {
    color: palette.gold,
    fontSize: 18,
    fontWeight: '600',
  },
  caption: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 8,
  },
});

