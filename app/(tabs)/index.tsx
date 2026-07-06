import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';
import { formatDate, formatMoney, normalizeSearch } from '@/utils/formatters';

export default function HomeScreen() {
  const { data } = useAppData();
  const colors = useThemeColors();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = normalizeSearch(query);
    if (!normalized) return data.orders.slice(0, 4);
    return data.orders.filter((order) => {
      const customer = data.customers.find((item) => item.id === order.customerId);
      return normalizeSearch(`${order.shortCode} ${customer?.name ?? ''} ${order.reportedIssue}`).includes(normalized);
    });
  }, [data.customers, data.orders, query]);

  const counters = {
    open: data.orders.filter((order) => order.status === 'open').length,
    progress: data.orders.filter((order) => ['diagnosis', 'in_progress', 'approved'].includes(order.status)).length,
    waiting: data.orders.filter((order) => ['waiting_approval', 'waiting_part'].includes(order.status)).length,
    completed: data.orders.filter((order) => ['completed', 'delivered'].includes(order.status)).length,
  };

  return (
    <ScreenContainer>
      <AppHeader title={`Ola, ${data.company?.tradeName || data.company?.name || 'OrdemPro'}`} subtitle="Seu painel de ordens de servico" />
      <AppButton title="Nova OS" icon={<Ionicons name="add-circle-outline" color={colors.white} size={18} />} onPress={() => router.push('/orders/new')} />
      <View style={styles.space} />
      <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar por OS, cliente ou problema..." />

      <View style={styles.grid}>
        {[
          ['Abertas', counters.open, colors.info],
          ['Em andamento', counters.progress, colors.primary],
          ['Aguardando', counters.waiting, colors.warning],
          ['Finalizadas', counters.completed, colors.success],
        ].map(([label, value, color]) => (
          <AppCard key={String(label)}>
            <AppText variant="small" muted>{label}</AppText>
            <AppText variant="h3" color={String(color)}>{String(value)}</AppText>
          </AppCard>
        ))}
      </View>

      <View style={styles.shortcuts}>
        <Shortcut icon="people-outline" label="Cliente" onPress={() => router.push('/customers/new')} />
        <Shortcut icon="construct-outline" label="Equipamento" onPress={() => router.push('/equipments/new')} />
        <Shortcut icon="document-text-outline" label="OS" onPress={() => router.push('/orders/new')} />
      </View>

      <AppText variant="subtitle" style={styles.section}>Ultimas OS</AppText>
      {filtered.map((order) => {
        const customer = data.customers.find((item) => item.id === order.customerId);
        return (
          <AppCard key={order.id} onPress={() => router.push(`/orders/${order.id}`)}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle">{order.shortCode}</AppText>
                <AppText muted>{customer?.name ?? 'Cliente nao encontrado'}</AppText>
                <AppText variant="small" muted>{formatDate(order.openedAt)} - {formatMoney(order.totalCents)}</AppText>
              </View>
              <StatusBadge status={order.status} />
            </View>
          </AppCard>
        );
      })}

      {data.backup.lastBackupAt ? null : (
        <AppCard onPress={() => router.push('/settings/backup')}>
          <AppText variant="subtitle">Backup pendente</AppText>
          <AppText muted>Exporte uma copia dos dados para evitar perdas.</AppText>
        </AppCard>
      )}
    </ScreenContainer>
  );
}

function Shortcut({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <AppText variant="caption">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  space: { height: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  shortcuts: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  shortcut: { flex: 1, borderWidth: 1, borderRadius: 14, alignItems: 'center', padding: spacing.sm, gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  section: { marginBottom: spacing.xs },
});
