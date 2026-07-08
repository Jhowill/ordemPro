import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';

import { radius, spacing, typography } from '@/constants/theme';
import { useIsDarkTheme, useThemeColors } from '@/hooks/useThemeColors';
import { AppText } from './AppText';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function InputField({ label, error, style, ...props }: Props) {
  const colors = useThemeColors();
  const isDarkTheme = useIsDarkTheme();
  return (
    <View style={styles.wrap}>
      <AppText variant="small">{label}</AppText>
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        cursorColor={colors.primary}
        keyboardAppearance={props.keyboardAppearance ?? (isDarkTheme ? 'dark' : 'light')}
        selectionColor={colors.primary}
        style={[
          styles.input,
          typography.body,
          { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, color: colors.text },
          style,
        ]}
      />
      {error ? <AppText variant="caption" color={colors.danger}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, marginBottom: spacing.sm },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
});
