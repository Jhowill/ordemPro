import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { radius, spacing, typography } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useIsDarkTheme, useThemeColors } from '@/hooks/useThemeColors';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChangeText, placeholder }: Props) {
  const colors = useThemeColors();
  const isDarkTheme = useIsDarkTheme();
  const { t } = useI18n();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('common.search')}
        placeholderTextColor={colors.muted}
        cursorColor={colors.primary}
        keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
        selectionColor={colors.primary}
        style={[styles.input, typography.body, { color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  input: { flex: 1 },
});
