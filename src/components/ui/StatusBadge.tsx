import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { AppText } from './AppText';
import { statusColors, statusLabel } from '@/utils/formatters';

type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const { color, backgroundColor, borderColor } = statusColors(status);
  return (
    <View style={[styles.badge, { backgroundColor, borderColor }]}>
      <AppText variant="caption" color={color}>{statusLabel(status)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 5 },
});
