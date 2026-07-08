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

export default function EquipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const { t } = useI18n();
  const equipment = data.equipments.find((item) => item.id === id);
  if (!equipment) return <ScreenContainer><EmptyState icon="alert-circle-outline" title={t('details.notFoundEquipment')} description={t('details.notFoundDesc')} /></ScreenContainer>;
  const customer = data.customers.find((item) => item.id === equipment.customerId);
  const orders = data.orders.filter((order) => order.equipmentId === equipment.id);

  return (
    <ScreenContainer>
      <AppHeader title={`${equipment.type ?? equipment.category} ${equipment.brand ?? ''}`.trim()} subtitle={customer?.name ?? t('common.customer')} back action={<AppButton title={t('details.newOrder')} compact onPress={() => router.push('/orders/new')} />} />
      <AppCard>
        <AppText variant="subtitle">{t('details.equipmentTitle')}</AppText>
        <AppText>{t('details.model')} {equipment.model || '-'}</AppText>
        <AppText>{t('details.serial')} {equipment.serialNumber || '-'}</AppText>
        <AppText muted>{equipment.physicalState || t('details.physicalState')}</AppText>
      </AppCard>
      <PaginatedList
        items={orders}
        keyExtractor={(order) => order.id}
        empty={<AppText muted>{t('details.noEquipmentOrders')}</AppText>}
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
