import { StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { AppText } from './AppText';

type Props = {
  title: string;
  description?: string;
};

export function SectionTitle({ title, description }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText variant="subtitle">{title}</AppText>
      {description ? <AppText variant="small" muted>{description}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm, marginBottom: spacing.xs },
});

