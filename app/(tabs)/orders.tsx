import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';
import { ServiceOrderStatus } from '@/types';
import { formatMoney, normalizeSearch } from '@/utils/formatters';

type FilterKey = 'all' | ServiceOrderStatus;

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'open', label: 'Abertas' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'waiting_part', label: 'Aguardando' },
  { key: 'completed', label: 'Concluidas' },
];

export default function OrdersScreen() {
  const { data } = useAppData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const orders = useMemo(() => {
    const normalized = normalizeSearch(query);
    return data.orders.filter((order) => {
      const matchesFilter =
        filter === 'all' ||
        order.status === filter ||
        (filter === 'in_progress' && ['diagnosis', 'approved', 'in_progress'].includes(order.status)) ||
        (filter === 'waiting_part' && ['waiting_approval', 'waiting_part'].includes(order.status)) ||
        (filter === 'completed' && ['completed', 'delivered'].includes(order.status));
      if (!matchesFilter) return false;
      if (!normalized) return true;
      const customer = data.customers.find((item) => item.id === order.customerId);
      return normalizeSearch(`${order.shortCode} ${customer?.name ?? ''} ${order.reportedIssue}`).includes(normalized);
    });
  }, [data.customers, data.orders, filter, query]);

  return (
    <ScreenContainer>
      <AppHeader title="Ordens de Servico" subtitle={`${orders.length} registros`} action={<AppButton title="Nova OS" compact onPress={() => router.push('/orders/new')} />} />
      <View style={styles.filters}>
        {filters.map((item) => (
          <FilterChip key={item.key} label={item.label} active={filter === item.key} onPress={() => setFilter(item.key)} />
        ))}
      </View>
      <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar por numero, cliente ou equipamento..." />
      {orders.length === 0 ? (
        <EmptyState icon="clipboard-outline" title="Nenhuma OS encontrada" description="Crie uma ordem de servico para iniciar o controle." actionLabel="Nova OS" onAction={() => router.push('/orders/new')} />
      ) : (
        orders.map((order) => {
          const customer = data.customers.find((item) => item.id === order.customerId);
          const equipment = data.equipments.find((item) => item.id === order.equipmentId);
          return (
            <AppCard key={order.id} onPress={() => router.push(`/orders/${order.id}`)}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle">{order.shortCode}</AppText>
                  <AppText>{customer?.name ?? 'Cliente'}</AppText>
                  <AppText variant="small" muted>{equipment ? `${equipment.type ?? equipment.category} ${equipment.brand ?? ''} ${equipment.model ?? ''}` : 'Servico sem equipamento'}</AppText>
                  <AppText variant="small" muted>Total: {formatMoney(order.totalCents)}</AppText>
                </View>
                <StatusBadge status={order.status} />
              </View>
            </AppCard>
          );
        })
      )}
    </ScreenContainer>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border }]}>
      <AppText variant="caption" color={active ? colors.white : colors.text}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
});
