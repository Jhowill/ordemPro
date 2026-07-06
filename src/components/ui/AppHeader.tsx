import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppText } from './AppText';

type Props = {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: ReactNode;
};

export function AppHeader({ title, subtitle, back, action }: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.header}>
      {back ? (
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.titleWrap}>
        <AppText variant="h3">{title}</AppText>
        {subtitle ? <AppText variant="small" muted>{subtitle}</AppText> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  back: { width: 42, height: 42, justifyContent: 'center' },
  titleWrap: { flex: 1 },
});
