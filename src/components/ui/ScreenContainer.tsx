import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  footer?: ReactNode;
};

export function ScreenContainer({ children, scroll = true, padded = true, footer }: Props) {
  const colors = useThemeColors();
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, padded && styles.padded]} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fixed, padded && styles.padded]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
        {content}
        {footer ? <View style={[styles.footer, { backgroundColor: colors.background }]}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 28 },
  fixed: { flex: 1 },
  padded: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  footer: { padding: spacing.md },
});

