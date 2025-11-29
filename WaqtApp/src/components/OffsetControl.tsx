import type { PrayerIdentifier } from '@/types/prayer';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/theme/colors';

interface Props {
  id: PrayerIdentifier;
  label: string;
  value: number;
  onChange: (id: PrayerIdentifier, next: number) => void;
}

export const OffsetControl = ({ id, label, value, onChange }: Props) => {
  const increment = (delta: number) => onChange(id, value + delta);

  return (
    <View style={styles.wrapper}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.caption}>Adjust Azan timing</Text>
      </View>
      <View style={styles.controls}>
        <Pressable style={styles.chip} onPress={() => increment(-5)}>
          <Text style={styles.chipText}>-5</Text>
        </Pressable>
        <Text style={styles.value}>
          {value > 0 ? `+${value}` : value} mins
        </Text>
        <Pressable style={styles.chip} onPress={() => increment(5)}>
          <Text style={styles.chipText}>+5</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '600',
  },
  caption: {
    color: palette.muted,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  chipText: {
    color: palette.white,
    fontWeight: '600',
  },
  value: {
    color: palette.gold,
    fontWeight: '700',
  },
});

