import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

type Props = {
  children: ReactNode;
  onPress?: () => void;
};

export function AppCard({ children, onPress }: Props) {
  const colors = useThemeColors();
  const style = [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }];
  if (onPress) return <Pressable style={({ pressed }) => [style, pressed && { opacity: 0.75 }]} onPress={onPress}>{children}</Pressable>;
  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});

