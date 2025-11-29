import type { PrayerScheduleItem } from '@/types/prayer';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { formatPrayerTime } from '@/utils/time';
import { palette } from '@/theme/colors';

interface Props {
  data: PrayerScheduleItem[];
}

export const PrayerList = ({ data }: Props) => (
  <FlatList
    data={data}
    keyExtractor={item => item.id}
    scrollEnabled={false}
    ItemSeparatorComponent={() => <View style={styles.separator} />}
    renderItem={({ item }) => (
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>{item.label}</Text>
          <Text style={styles.caption}>
            {item.offsetMinutes === 0
              ? 'Exact Azan time'
              : `${item.offsetMinutes > 0 ? '+' : ''}${item.offsetMinutes} mins adjustment`}
          </Text>
        </View>
        <Text style={styles.time}>{formatPrayerTime(item.adjusted)}</Text>
      </View>
    )}
  />
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '600',
  },
  caption: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    color: palette.gold,
    fontSize: 18,
    fontWeight: '600',
  },
});

