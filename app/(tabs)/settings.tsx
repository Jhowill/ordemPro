import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';
import { AppLocale, ThemeMode } from '@/types';

type SettingsIcon = keyof typeof Ionicons.glyphMap;

const rows = [
  { icon: 'business-outline', key: 'company', href: '/settings/company' },
  { icon: 'construct-outline', key: 'technician', href: '/settings/technician' },
  { icon: 'document-text-outline', key: 'pdf', href: '/settings/pdf' },
  { icon: 'briefcase-outline', key: 'services', href: '/catalog/services' },
  { icon: 'cube-outline', key: 'parts', href: '/catalog/parts' },
  { icon: 'cloud-upload-outline', key: 'backup', href: '/settings/backup' },
  { icon: 'lock-closed-outline', key: 'security', href: '/settings/security' },
] as const;

const themeOptions: { mode: ThemeMode; key: 'system' | 'light' | 'dark'; icon: SettingsIcon }[] = [
  { mode: 'system', key: 'system', icon: 'phone-portrait-outline' },
  { mode: 'light', key: 'light', icon: 'sunny-outline' },
  { mode: 'dark', key: 'dark', icon: 'moon-outline' },
];

const localeOptions: { locale: AppLocale; icon: SettingsIcon }[] = [
  { locale: 'pt', icon: 'chatbubble-ellipses-outline' },
  { locale: 'en', icon: 'language-outline' },
  { locale: 'fr', icon: 'flag-outline' },
  { locale: 'es', icon: 'earth-outline' },
];

export default function SettingsScreen() {
  const { data, saveThemeMode, saveLocale } = useAppData();
  const colors = useThemeColors();
  const { t, localeName } = useI18n();

  async function selectThemeMode(themeMode: ThemeMode) {
    if (themeMode === data.themeMode) return;
    try {
      await saveThemeMode(themeMode);
    } catch (error) {
      Alert.alert(t('settings.theme'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  async function selectLocale(locale: AppLocale) {
    if (locale === data.locale) return;
    try {
      await saveLocale(locale);
    } catch (error) {
      Alert.alert(t('settings.locale'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <AppCard>
        <View style={styles.themeHeader}>
          <Ionicons name="contrast-outline" size={22} color={colors.primary} />
          <View style={styles.themeText}>
            <AppText variant="subtitle">{t('settings.theme')}</AppText>
            <AppText muted>{t('settings.themeCurrent', { label: t(`settings.themes.${themeOptions.find((option) => option.mode === data.themeMode)?.key ?? 'system'}`) })}</AppText>
          </View>
        </View>
        <View style={[styles.segmented, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          {themeOptions.map((option) => {
            const active = option.mode === data.themeMode;
            return (
              <Pressable
                key={option.mode}
                onPress={() => selectThemeMode(option.mode)}
                style={[styles.segment, active && { backgroundColor: colors.primary }]}
              >
                <Ionicons name={option.icon} size={18} color={active ? colors.white : colors.muted} />
                <AppText variant="caption" color={active ? colors.white : colors.text}>{t(`settings.themes.${option.key}`)}</AppText>
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.themeHeader}>
          <Ionicons name="globe-outline" size={22} color={colors.primary} />
          <View style={styles.themeText}>
            <AppText variant="subtitle">{t('settings.locale')}</AppText>
            <AppText muted>{localeName(data.locale)}</AppText>
          </View>
        </View>
        <View style={[styles.segmented, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          {localeOptions.map((option) => {
            const active = option.locale === data.locale;
            return (
              <Pressable
                key={option.locale}
                onPress={() => selectLocale(option.locale)}
                style={[styles.segment, active && { backgroundColor: colors.primary }]}
              >
                <Ionicons name={option.icon} size={18} color={active ? colors.white : colors.muted} />
                <AppText variant="caption" color={active ? colors.white : colors.text}>{localeName(option.locale)}</AppText>
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      {rows.map((item) => (
        <AppCard key={item.href} onPress={() => router.push(item.href)}>
          <View style={styles.row}>
            <Ionicons name={item.icon} size={22} color={colors.primary} />
            <AppText variant="subtitle" style={{ flex: 1 }}>{t(`settings.rows.${item.key}`)}</AppText>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </View>
        </AppCard>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  themeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  themeText: { flex: 1 },
  segmented: { flexDirection: 'row', borderWidth: 1, borderRadius: 10, padding: 3, gap: 3, marginTop: spacing.sm, flexWrap: 'wrap' },
  segment: { flex: 1, minHeight: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.xs },
});
