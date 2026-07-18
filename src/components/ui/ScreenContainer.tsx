import { ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  footer?: ReactNode;
  scrollEnabled?: ScrollViewProps['scrollEnabled'];
};

export function ScreenContainer({ children, scroll = true, scrollEnabled = true, padded = true, footer }: Props) {
  const colors = useThemeColors();
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, padded && styles.padded]}
      scrollEnabled={scrollEnabled}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={Keyboard.dismiss}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fixed, padded && styles.padded]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Pressable accessible={false} onPress={Keyboard.dismiss} style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.safe}>
          {content}
          {footer ? <View style={[styles.footer, { backgroundColor: colors.background }]}>{footer}</View> : null}
        </KeyboardAvoidingView>
      </Pressable>
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
