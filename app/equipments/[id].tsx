import { router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppData } from '@/services/storage';

export default function EquipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const equipment = data.equipments.find((item) => item.id === id);
  if (!equipment) return <ScreenContainer><EmptyState icon="alert-circle-outline" title="Equipamento nao encontrado" description="O cadastro pode ter sido removido." /></ScreenContainer>;
  const customer = data.customers.find((item) => item.id === equipment.customerId);
  const orders = data.orders.filter((order) => order.equipmentId === equipment.id);

  return (
    <ScreenContainer>
      <AppHeader title={`${equipment.type ?? equipment.category} ${equipment.brand ?? ''}`} subtitle={customer?.name ?? 'Cliente'} back action={<AppButton title="Nova OS" onPress={() => router.push('/orders/new')} />} />
      <AppCard>
        <AppText variant="subtitle">Identificacao</AppText>
        <AppText>Modelo: {equipment.model || '-'}</AppText>
        <AppText>Serie: {equipment.serialNumber || '-'}</AppText>
        <AppText muted>{equipment.physicalState || 'Estado fisico nao informado'}</AppText>
      </AppCard>
      {orders.map((order) => (
        <AppCard key={order.id} onPress={() => router.push(`/orders/${order.id}`)}>
          <AppText variant="subtitle">{order.shortCode}</AppText>
          <AppText muted>{order.reportedIssue}</AppText>
          <StatusBadge status={order.status} />
        </AppCard>
      ))}
    </ScreenContainer>
  );
}

