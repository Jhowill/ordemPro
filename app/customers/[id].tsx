import { router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useI18n } from '@/hooks/useI18n';
import { useAppData } from '@/services/storage';
import { formatMoney } from '@/utils/formatters';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const { t } = useI18n();
  const customer = data.customers.find((item) => item.id === id);
  if (!customer) return <ScreenContainer><EmptyState icon="alert-circle-outline" title={t('details.notFoundCustomer')} description={t('details.notFoundDesc')} /></ScreenContainer>;
  const orders = data.orders.filter((order) => order.customerId === customer.id);
  const total = orders.reduce((sum, order) => sum + order.totalCents, 0);

  return (
    <ScreenContainer>
      <AppHeader title={customer.name} subtitle={t('details.customerTitle')} back action={<AppButton title={t('details.newOrder')} compact onPress={() => router.push('/orders/new')} />} />
      <AppCard>
        <AppText variant="subtitle">{t('details.customerTitle')}</AppText>
        <AppText muted>{customer.phone || customer.whatsapp || t('customers.noPhone')}</AppText>
        <AppText muted>{customer.email || t('common.noEmail')}</AppText>
        <AppText muted>{customer.city ? `${customer.city}/${customer.state}` : t('common.noAddress')}</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">{t('details.customerSummary')}</AppText>
        <AppText>{t('details.ordersLinked', { count: orders.length })}</AppText>
        <AppText>{t('details.totalSpent', { total: formatMoney(total) })}</AppText>
      </AppCard>
      <PaginatedList
        items={orders}
        keyExtractor={(order) => order.id}
        empty={<AppText muted>{t('details.noOrders')}</AppText>}
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
