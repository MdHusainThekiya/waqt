import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Share from 'react-native-share';
import dayjs from 'dayjs';

import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { palette } from '@/theme/colors';
import { calculateMonthSchedule } from '@/services/prayerTimes';
import { usePrayerSettingsStore } from '@/store/usePrayerSettingsStore';
import { formatHijriDate } from '@/utils/date';

export const CalendarScreen = () => {
  const location = usePrayerSettingsStore(state => state.location);
  const offsets = usePrayerSettingsStore(state => state.prayerOffsets);
  const juristicMethod = usePrayerSettingsStore(state => state.juristicMethod);
  const calculationMethod = usePrayerSettingsStore(
    state => state.calculationMethod,
  );

  const data = useMemo(
    () =>
      calculateMonthSchedule({
        location,
        offsets,
        juristicMethod,
        calculationMethod,
      }),
    [location, offsets, juristicMethod, calculationMethod],
  );

  const handleShare = async () => {
    try {
      await Share.open({
        title: 'Waqt Prayer Timetable',
        message: `Sharing prayer timetable for ${dayjs().format(
          'MMMM YYYY',
        )} via Waqt.`,
      });
    } catch (error) {
      if ((error as Error)?.message !== 'User did not share') {
        console.warn('Share failed', error);
      }
    }
  };

  return (
    <GradientBackground>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>
            {dayjs().format('MMMM YYYY')} • {formatHijriDate(new Date())}
          </Text>
        </View>
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </View>

      <GlassCard style={styles.cardContainer}>
        <FlatList
          data={data}
          keyExtractor={item => item.date}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.dateColumn}>
                <Text style={styles.dayLabel}>
                  {dayjs(item.date).format('DD')}
                </Text>
                <Text style={styles.weekdayLabel}>
                  {dayjs(item.date).format('ddd')}
                </Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.hijriLabel}>
                  {formatHijriDate(item.date)}
                </Text>
                <View style={styles.timesRow}>
                  {item.schedule.map(p => (
                    <View key={p.id} style={styles.timeItem}>
                      <Text style={styles.timeLabel}>
                        {p.label.substring(0, 1)}
                      </Text>
                      <Text style={styles.timeValue}>
                        {p.adjusted.format('HH:mm')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        />
      </GlassCard>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.muted,
    marginTop: 4,
    fontSize: 13,
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shareText: {
    color: palette.white,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateColumn: {
    alignItems: 'center',
    width: 50,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
  dayLabel: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
  },
  weekdayLabel: {
    color: palette.muted,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  infoColumn: {
    flex: 1,
  },
  hijriLabel: {
    color: palette.gold,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  timesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    color: palette.muted,
    fontSize: 10,
    marginBottom: 2,
  },
  timeValue: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

