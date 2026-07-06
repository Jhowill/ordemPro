import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={42} color={colors.primary} />
      <AppText variant="title" style={styles.center}>{title}</AppText>
      <AppText muted style={styles.center}>{description}</AppText>
      {actionLabel ? <AppButton title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing['3xl'] },
  center: { textAlign: 'center' },
});

