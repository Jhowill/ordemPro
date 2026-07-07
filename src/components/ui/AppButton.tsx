import { ReactNode, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppText } from './AppText';

type Props = {
  title: string;
  onPress?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: ReactNode;
  loading?: boolean;
  compact?: boolean;
};

export function AppButton({ title, onPress, variant = 'primary', icon, loading, compact }: Props) {
  const colors = useThemeColors();
  const lastPressAt = useRef(0);
  const backgroundColor = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.primarySoft;
  const textColor = variant === 'secondary' ? colors.primary : colors.white;

  function handlePress() {
    const now = Date.now();
    if (now - lastPressAt.current < 650) return;
    lastPressAt.current = now;
    onPress?.();
  }

  return (
    <Pressable style={({ pressed }) => [styles.button, compact ? styles.compact : styles.grow, { backgroundColor }, pressed && { opacity: 0.8 }]} onPress={handlePress} disabled={loading}>
      {loading ? <ActivityIndicator color={textColor} /> : <View style={styles.inner}>{icon}<AppText variant="button" color={textColor}>{title}</AppText></View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  grow: { flexGrow: 1, alignSelf: 'stretch' },
  compact: { minHeight: 44, alignSelf: 'auto' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
