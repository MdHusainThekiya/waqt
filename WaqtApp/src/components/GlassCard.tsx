import type { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { glass } from '@/theme/colors';

interface Props extends PropsWithChildren, ViewProps {}

export const GlassCard = ({ children, style, ...rest }: Props) => (
  <View style={[styles.card, style]} {...rest}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.background,
    padding: 20,
  },
});

