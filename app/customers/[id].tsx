import { router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppData } from '@/services/storage';
import { formatMoney } from '@/utils/formatters';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const customer = data.customers.find((item) => item.id === id);
  if (!customer) return <ScreenContainer><EmptyState icon="alert-circle-outline" title="Cliente nao encontrado" description="O cadastro pode ter sido removido." /></ScreenContainer>;
  const orders = data.orders.filter((order) => order.customerId === customer.id);
  const total = orders.reduce((sum, order) => sum + order.totalCents, 0);

  return (
    <ScreenContainer>
      <AppHeader title={customer.name} subtitle="Detalhes do cliente" back action={<AppButton title="Nova OS" compact onPress={() => router.push('/orders/new')} />} />
      <AppCard>
        <AppText variant="subtitle">Contato</AppText>
        <AppText muted>{customer.phone || customer.whatsapp}</AppText>
        <AppText muted>{customer.email || 'Sem e-mail'}</AppText>
        <AppText muted>{customer.city ? `${customer.city}/${customer.state}` : 'Endereco nao informado'}</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">Resumo</AppText>
        <AppText>{orders.length} ordens de servico</AppText>
        <AppText>Total gasto: {formatMoney(total)}</AppText>
      </AppCard>
      <PaginatedList
        items={orders}
        keyExtractor={(order) => order.id}
        empty={<AppText muted>Nenhuma OS vinculada a este cliente.</AppText>}
        renderItem={(order) => (
          <AppCard key={order.id} onPress={() => router.push(`/orders/${order.id}`)}>
            <AppText variant="subtitle">{order.shortCode}</AppText>
            <AppText muted>{order.reportedIssue}</AppText>
            <StatusBadge status={order.status} />
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}
