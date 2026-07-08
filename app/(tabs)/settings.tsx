import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';
import { ThemeMode } from '@/types';

type SettingsIcon = keyof typeof Ionicons.glyphMap;

const rows = [
  ['business-outline', 'Dados da empresa', '/settings/company'],
  ['construct-outline', 'Tecnico responsavel', '/settings/technician'],
  ['document-text-outline', 'PDF e termos', '/settings/pdf'],
  ['briefcase-outline', 'Catalogo de servicos', '/catalog/services'],
  ['cube-outline', 'Catalogo de pecas', '/catalog/parts'],
  ['cloud-upload-outline', 'Backup', '/settings/backup'],
  ['lock-closed-outline', 'Seguranca', '/settings/security'],
] as const;

const themeOptions: { mode: ThemeMode; label: string; icon: SettingsIcon }[] = [
  { mode: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
  { mode: 'light', label: 'Claro', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Escuro', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { data, saveThemeMode } = useAppData();
  const colors = useThemeColors();

  async function selectThemeMode(themeMode: ThemeMode) {
    if (themeMode === data.themeMode) return;
    try {
      await saveThemeMode(themeMode);
    } catch (error) {
      Alert.alert('Tema nao salvo', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title="Configuracoes" subtitle="Empresa, PDF, backup e preferencias" />
      <AppCard>
        <View style={styles.themeHeader}>
          <Ionicons name="contrast-outline" size={22} color={colors.primary} />
          <View style={styles.themeText}>
            <AppText variant="subtitle">Tema do app</AppText>
            <AppText muted>Atual: {themeOptions.find((option) => option.mode === data.themeMode)?.label ?? 'Sistema'}</AppText>
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
                <AppText variant="caption" color={active ? colors.white : colors.text}>{option.label}</AppText>
              </Pressable>
            );
          })}
        </View>
      </AppCard>
      {rows.map(([icon, title, href]) => (
        <AppCard key={href} onPress={() => router.push(href)}>
          <View style={styles.row}>
            <Ionicons name={icon} size={22} color={colors.primary} />
            <AppText variant="subtitle" style={{ flex: 1 }}>{title}</AppText>
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
  segmented: { flexDirection: 'row', borderWidth: 1, borderRadius: 10, padding: 3, gap: 3, marginTop: spacing.sm },
  segment: { flex: 1, minHeight: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.xs },
});
