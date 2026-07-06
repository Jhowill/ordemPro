import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/theme';
import { useAppData } from '@/services/storage';
import { formatMoney, normalizeSearch } from '@/utils/formatters';

export default function OrdersScreen() {
  const { data } = useAppData();
  const [query, setQuery] = useState('');

  const orders = useMemo(() => {
    const normalized = normalizeSearch(query);
    if (!normalized) return data.orders;
    return data.orders.filter((order) => {
      const customer = data.customers.find((item) => item.id === order.customerId);
      return normalizeSearch(`${order.shortCode} ${customer?.name ?? ''} ${order.reportedIssue}`).includes(normalized);
    });
  }, [data.customers, data.orders, query]);

  return (
    <ScreenContainer>
      <AppHeader title="Ordens de Servico" subtitle={`${orders.length} registros`} action={<AppButton title="Nova OS" onPress={() => router.push('/orders/new')} />} />
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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
});

