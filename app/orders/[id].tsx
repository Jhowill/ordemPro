import { router, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/theme';
import { useAppData } from '@/services/storage';
import { ServiceOrderStatus } from '@/types';
import { formatDate, formatMoney, statusLabel } from '@/utils/formatters';

const nextStatuses: ServiceOrderStatus[] = ['diagnosis', 'waiting_approval', 'approved', 'in_progress', 'waiting_part', 'completed', 'delivered'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updateOrderStatus } = useAppData();
  const order = data.orders.find((item) => item.id === id);
  if (!order) return <ScreenContainer><EmptyState icon="alert-circle-outline" title="OS nao encontrada" description="A ordem pode ter sido removida." /></ScreenContainer>;
  const activeOrder = order;
  const customer = data.customers.find((item) => item.id === activeOrder.customerId);
  const equipment = data.equipments.find((item) => item.id === activeOrder.equipmentId);
  const items = data.items.filter((item) => item.orderId === activeOrder.id);
  const statusHistory = data.statusHistory.filter((item) => item.orderId === activeOrder.id);

  function advanceStatus() {
    const currentIndex = nextStatuses.indexOf(activeOrder.status);
    const next = currentIndex >= 0 ? nextStatuses[currentIndex + 1] : 'diagnosis';
    if (!next) return;
    updateOrderStatus(activeOrder.id, next);
  }

  function cancel() {
    Alert.alert('Cancelar OS', 'Deseja marcar esta OS como cancelada?', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Cancelar OS', style: 'destructive', onPress: () => updateOrderStatus(activeOrder.id, 'cancelled') },
    ]);
  }

  return (
    <ScreenContainer>
      <AppHeader title={activeOrder.shortCode} subtitle={customer?.name ?? 'Cliente'} back action={<StatusBadge status={activeOrder.status} />} />
      <View style={styles.actions}>
        <AppButton title={activeOrder.status === 'delivered' ? 'Ver PDF' : 'Avancar status'} onPress={activeOrder.status === 'delivered' ? () => router.push(`/orders/${activeOrder.id}/pdf`) : advanceStatus} />
        <AppButton title="PDF" variant="secondary" onPress={() => router.push(`/orders/${activeOrder.id}/pdf`)} />
      </View>

      <AppCard>
        <SectionTitle title="Cliente" />
        <AppText>{customer?.name ?? '-'}</AppText>
        <AppText muted>{customer?.phone ?? customer?.whatsapp ?? '-'}</AppText>
      </AppCard>

      <AppCard>
        <SectionTitle title="Equipamento" />
        <AppText>{equipment ? `${equipment.type ?? equipment.category} ${equipment.brand ?? ''} ${equipment.model ?? ''}` : 'Servico sem equipamento'}</AppText>
        <AppText muted>{equipment?.serialNumber ?? ''}</AppText>
      </AppCard>

      <AppCard>
        <SectionTitle title="Problema e diagnostico" />
        <AppText>{activeOrder.reportedIssue}</AppText>
        <AppText muted>{activeOrder.diagnosis || 'Diagnostico ainda nao informado.'}</AppText>
      </AppCard>

      <AppCard>
        <SectionTitle title="Pecas e servicos" />
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <AppText style={{ flex: 1 }}>{item.description}</AppText>
            <AppText>{formatMoney(item.totalCents)}</AppText>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <SectionTitle title="Resumo financeiro" />
        <View style={styles.item}><AppText>Servicos</AppText><AppText>{formatMoney(activeOrder.laborTotalCents)}</AppText></View>
        <View style={styles.item}><AppText>Pecas</AppText><AppText>{formatMoney(activeOrder.partsTotalCents)}</AppText></View>
        <View style={styles.item}><AppText variant="subtitle">Total</AppText><AppText variant="subtitle">{formatMoney(activeOrder.totalCents)}</AppText></View>
        <View style={styles.item}><AppText>Pendente</AppText><AppText>{formatMoney(activeOrder.pendingCents)}</AppText></View>
      </AppCard>

      <AppCard>
        <SectionTitle title="Historico de status" description="Registro local salvo no SQLite" />
        {statusHistory.length ? statusHistory.map((history) => (
          <View key={history.id} style={styles.timelineItem}>
            <AppText variant="subtitle">{statusLabel(history.toStatus)}</AppText>
            <AppText muted>
              {history.fromStatus ? `${statusLabel(history.fromStatus)} -> ` : ''}
              {formatDate(history.changedAt)}
            </AppText>
          </View>
        )) : (
          <AppText muted>Nenhuma alteracao registrada ainda.</AppText>
        )}
      </AppCard>

      <AppButton title="Cancelar OS" variant="danger" onPress={cancel} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.xs },
  timelineItem: { borderLeftWidth: 2, paddingLeft: spacing.sm, marginBottom: spacing.sm },
});
