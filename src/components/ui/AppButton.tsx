import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppText } from './AppText';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: ReactNode;
  loading?: boolean;
};

export function AppButton({ title, onPress, variant = 'primary', icon, loading }: Props) {
  const colors = useThemeColors();
  const backgroundColor = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.primarySoft;
  const textColor = variant === 'secondary' ? colors.primary : colors.white;

  return (
    <Pressable style={({ pressed }) => [styles.button, { backgroundColor }, pressed && { opacity: 0.8 }]} onPress={onPress} disabled={loading}>
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
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
