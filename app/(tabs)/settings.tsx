import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

const rows = [
  ['business-outline', 'Dados da empresa', '/settings/company'],
  ['document-text-outline', 'PDF e termos', '/settings/pdf'],
  ['briefcase-outline', 'Catalogo de servicos', '/catalog/services'],
  ['cube-outline', 'Catalogo de pecas', '/catalog/parts'],
  ['cloud-upload-outline', 'Backup', '/settings/backup'],
  ['lock-closed-outline', 'Seguranca', '/settings/security'],
] as const;

export default function SettingsScreen() {
  const colors = useThemeColors();
  return (
    <ScreenContainer>
      <AppHeader title="Configuracoes" subtitle="Empresa, PDF, backup e preferencias" />
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
});

