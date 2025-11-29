import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { palette } from '@/theme/colors';

interface QiblaCompassProps {
  qiblaDirection: number;
  currentHeading: number;
}

export const QiblaCompass = ({
  qiblaDirection,
  currentHeading,
}: QiblaCompassProps) => {
  const rotation = qiblaDirection - currentHeading;

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withSpring(`${rotation}deg`) }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.compassOuter}>
        <Animated.View style={[styles.compassInner, compassStyle]}>
          <View style={styles.needle} />
          <Text style={styles.kaaba}>🕋</Text>
        </Animated.View>
      </View>
      <Text style={styles.degreeText}>{Math.round(qiblaDirection)}°</Text>
      <Text style={styles.label}>Qibla Direction</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: palette.gold,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  compassInner: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needle: {
    position: 'absolute',
    top: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 80,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: palette.gold,
  },
  kaaba: {
    fontSize: 40,
    marginTop: 60,
  },
  degreeText: {
    color: palette.white,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    color: palette.muted,
    fontSize: 14,
  },
});
