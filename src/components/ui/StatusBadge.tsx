import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppText } from './AppText';
import { statusLabel } from '@/utils/formatters';

type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const colors = useThemeColors();
  const color = status === 'cancelled' ? colors.danger : status === 'completed' || status === 'delivered' ? colors.success : status === 'waiting_approval' || status === 'waiting_part' ? colors.warning : colors.info;
  const backgroundColor = status === 'cancelled' ? colors.dangerSoft : status === 'completed' || status === 'delivered' ? colors.successSoft : status === 'waiting_approval' || status === 'waiting_part' ? colors.warningSoft : colors.infoSoft;
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <AppText variant="caption" color={color}>{statusLabel(status)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 5 },
});

