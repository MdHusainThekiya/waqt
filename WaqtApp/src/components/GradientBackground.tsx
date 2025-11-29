import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import type { PrayerIdentifier } from '@/types/prayer';
import { getGradientForPrayer } from '@/theme';

interface Props extends PropsWithChildren {
  prayerKey?: PrayerIdentifier;
}

export const GradientBackground = ({ children, prayerKey }: Props) => {
  const [start, end] = getGradientForPrayer(prayerKey);

  return (
    <LinearGradient colors={[start, end]} style={styles.container}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
});

