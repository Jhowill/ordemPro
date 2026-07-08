import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { InputField } from '@/components/ui/InputField';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';
import { CatalogPart, CatalogService, OrderItemType, PaymentMethod, ServiceOrderPriority } from '@/types';
import { formatMoney, formatMoneyInput, makeId, moneyFromText } from '@/utils/formatters';

type DraftItem = { id: string; type: OrderItemType; description: string; quantity: number | null; unitPriceCents: number; discountCents: number };

const priorities: ServiceOrderPriority[] = ['low', 'normal', 'high', 'urgent'];
const paymentMethods: PaymentMethod[] = ['cash', 'pix', 'debit_card', 'credit_card', 'bank_transfer', 'other'];

export default function EditOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updateOrder, replaceOrderItems, addPayment } = useAppData();
  const colors = useThemeColors();
  const { t } = useI18n();
  const order = data.orders.find((item) => item.id === id);
  const [saving, setSaving] = useState(false);
  const [technicianId, setTechnicianId] = useState(order?.technicianId ?? data.technicians.find((item) => item.isDefault)?.id ?? data.technicians[0]?.id ?? '');
  const [priority, setPriority] = useState<ServiceOrderPriority>(order?.priority ?? 'normal');
  const [expectedCompletionAt, setExpectedCompletionAt] = useState(order?.expectedCompletionAt ?? '');
  const [reportedIssue, setReportedIssue] = useState(order?.reportedIssue ?? '');
  const [diagnosis, setDiagnosis] = useState(order?.diagnosis ?? '');
  const [performedService, setPerformedService] = useState(order?.performedService ?? '');
  const [warrantyDays, setWarrantyDays] = useState(String(order?.warrantyDays ?? ''));
  const [approved, setApproved] = useState(order?.isApprovedByCustomer ?? false);
  const [paymentValue, setPaymentValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [manualItem, setManualItem] = useState({ description: '', price: '' });
  const [items, setItems] = useState<DraftItem[]>(
    data.items
      .filter((item) => item.orderId === id)
      .map((item) => ({
        id: item.id,
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        discountCents: item.discountCents,
      })),
  );

  if (!order) return <ScreenContainer><EmptyState icon="alert-circle-outline" title={t('orderDetail.notFound')} description={t('orderDetail.notFoundDesc')} /></ScreenContainer>;
  const activeOrder = order;

  async function save() {
    if (!reportedIssue.trim()) {
      Alert.alert(t('orderEdit.alerts.issueRequired'));
      return;
    }
    try {
      setSaving(true);
      await updateOrder(activeOrder.id, {
        technicianId: technicianId || null,
        expectedCompletionAt,
        priority,
        reportedIssue,
        diagnosis,
        performedService,
        warrantyDays: warrantyDays ? Number(warrantyDays) : undefined,
        isApprovedByCustomer: approved,
      });
      await replaceOrderItems(activeOrder.id, items.map((item) => ({ ...item, quantity: item.quantity ?? 1 })));
      const amountCents = moneyFromText(paymentValue);
      if (amountCents > 0) {
        await addPayment(activeOrder.id, { amountCents, method: paymentMethod, paidAt: new Date().toISOString() });
      }
      router.back();
    } catch (error) {
      Alert.alert(t('orderEdit.alerts.saveFail'), error instanceof Error ? error.message : t('common.retry'));
    } finally {
      setSaving(false);
    }
  }

  function addManualItem(type: OrderItemType) {
    if (!manualItem.description.trim()) return;
    setItems((current) => [
      ...current,
      {
        id: makeId('draft_item'),
        type,
        description: manualItem.description,
        quantity: 1,
        unitPriceCents: moneyFromText(manualItem.price),
        discountCents: 0,
      },
    ]);
    setManualItem({ description: '', price: '' });
  }

  function addCatalogService(service: CatalogService) {
    setItems((current) => [
      ...current,
      { id: makeId('draft_service'), type: 'service', description: service.name, quantity: 1, unitPriceCents: service.defaultPriceCents, discountCents: 0 },
    ]);
  }

  function addCatalogPart(part: CatalogPart) {
    setItems((current) => [
      ...current,
      { id: makeId('draft_part'), type: 'part', description: part.name, quantity: 1, unitPriceCents: part.salePriceCents, discountCents: 0 },
    ]);
  }

  function updateItem(id: string, input: Partial<Pick<DraftItem, 'quantity' | 'unitPriceCents' | 'discountCents'>>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }

  function updateItemQuantity(id: string, value: string) {
    const digits = value.replace(/\D/g, '');
    updateItem(id, { quantity: digits ? Math.max(1, Number(digits)) : null });
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  const itemsTotal = items.reduce((sum, item) => sum + Math.max(0, (item.quantity ?? 0) * item.unitPriceCents - item.discountCents), 0);

  return (
    <ScreenContainer footer={<AppButton title={t('orderEdit.save')} loading={saving} onPress={save} />}>
      <AppHeader title={t('orderEdit.title')} subtitle={activeOrder.shortCode} back />

      <AppCard>
        <SectionTitle title={t('orderEdit.technician')} />
        <PaginatedList
          items={data.technicians}
          keyExtractor={(technician) => technician.id}
          renderItem={(technician) => (
            <Pressable key={technician.id} onPress={() => setTechnicianId(technician.id)} style={styles.option}>
              <AppText variant="subtitle" color={technicianId === technician.id ? colors.primary : undefined}>{technician.name}</AppText>
              <AppText muted>{technician.signatureUri ? t('orderEdit.technicianReady') : t('orderEdit.technicianMissing')}</AppText>
            </Pressable>
          )}
        />
        <AppButton title={t('orderEdit.manageTechnician')} variant="secondary" compact onPress={() => router.push('/settings/technician')} />
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderEdit.technicalData')} />
        <InputField label={t('orderEdit.reportedIssue')} value={reportedIssue} onChangeText={setReportedIssue} multiline style={styles.textArea} />
        <InputField label={t('orderEdit.diagnosis')} value={diagnosis} onChangeText={setDiagnosis} multiline style={styles.textArea} />
        <InputField label={t('orderEdit.performedService')} value={performedService} onChangeText={setPerformedService} multiline style={styles.textArea} />
        <InputField label={t('orderEdit.forecast')} value={expectedCompletionAt} onChangeText={setExpectedCompletionAt} />
        <InputField label={t('orderEdit.warrantyDays')} value={warrantyDays} onChangeText={setWarrantyDays} keyboardType="numeric" />
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderEdit.approval')} />
        <View style={styles.row}>
          {priorities.map((item) => (
            <AppButton key={item} title={t(`orderEdit.priorities.${item}`)} variant={priority === item ? 'primary' : 'secondary'} compact onPress={() => setPriority(item)} />
          ))}
        </View>
        <AppButton title={approved ? t('orderEdit.approved') : t('orderEdit.markApproved')} variant={approved ? 'primary' : 'secondary'} onPress={() => setApproved((value) => !value)} />
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderEdit.partsAndServices')} description={t('orderEdit.totalItems', { total: formatMoney(itemsTotal) })} />
        <SectionTitle title={t('orderEdit.serviceCatalog')} />
        <PaginatedList
          items={data.services}
          keyExtractor={(service) => service.id}
          empty={<AppText muted>{t('catalog.servicesEmpty')}</AppText>}
          renderItem={(service) => (
            <View key={service.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <AppText variant="subtitle">{service.name}</AppText>
                <AppText muted>{service.category ?? t('catalog.category')} - {formatMoney(service.defaultPriceCents)}</AppText>
              </View>
              <AppButton title={t('common.add')} variant="secondary" compact onPress={() => addCatalogService(service)} />
            </View>
          )}
        />
        <SectionTitle title={t('orderEdit.partCatalog')} />
        <PaginatedList
          items={data.parts}
          keyExtractor={(part) => part.id}
          empty={<AppText muted>{t('catalog.partsEmpty')}</AppText>}
          renderItem={(part) => (
            <View key={part.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <AppText variant="subtitle">{part.name}</AppText>
                <AppText muted>{part.category ?? t('catalog.category')} - {formatMoney(part.salePriceCents)}</AppText>
              </View>
              <AppButton title={t('common.add')} variant="secondary" compact onPress={() => addCatalogPart(part)} />
            </View>
          )}
        />
        <SectionTitle title={t('orderEdit.manualItem')} />
        <InputField label={t('orderEdit.description')} value={manualItem.description} onChangeText={(value) => setManualItem((current) => ({ ...current, description: value }))} />
        <InputField label={t('orderEdit.paymentValue')} value={manualItem.price} onChangeText={(value) => setManualItem((current) => ({ ...current, price: formatMoneyInput(value) }))} keyboardType="numeric" />
        <View style={styles.row}>
          <AppButton title={t('orderEdit.serviceCatalog')} variant="secondary" compact onPress={() => addManualItem('service')} />
          <AppButton title={t('orderEdit.partCatalog')} variant="secondary" compact onPress={() => addManualItem('part')} />
        </View>
        <SectionTitle title={t('orderDetail.serviceParts')} />
        <PaginatedList
          items={items}
          keyExtractor={(item) => item.id}
          empty={<AppText muted>{t('orderDetail.noItems')}</AppText>}
          renderItem={(item) => (
            <View key={item.id} style={[styles.itemBlock, { borderTopColor: colors.border }]}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <AppText variant="subtitle">{item.description}</AppText>
                  <AppText muted>{item.type === 'service' ? t('orderEdit.serviceCatalog') : t('orderEdit.partCatalog')} - {t('orderEdit.totalItems', { total: formatMoney(Math.max(0, (item.quantity ?? 0) * item.unitPriceCents - item.discountCents)) })}</AppText>
                </View>
                <AppButton title={t('orderEdit.remove')} variant="danger" compact onPress={() => removeItem(item.id)} />
              </View>
              <View style={styles.compactFields}>
                <InputField label={t('orderEdit.quantity')} value={item.quantity === null ? '' : String(item.quantity)} onChangeText={(value) => updateItemQuantity(item.id, value)} keyboardType="numeric" style={styles.compactInput} />
                <InputField label={t('common.unitValue')} value={formatMoney(item.unitPriceCents)} onChangeText={(value) => updateItem(item.id, { unitPriceCents: moneyFromText(value) })} keyboardType="numeric" style={styles.compactInput} />
                <InputField label={t('orderEdit.discount')} value={formatMoney(item.discountCents)} onChangeText={(value) => updateItem(item.id, { discountCents: moneyFromText(value) })} keyboardType="numeric" style={styles.compactInput} />
              </View>
            </View>
          )}
        />
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderEdit.payment')} description={t('orderEdit.pendingCurrent', { total: formatMoney(activeOrder.pendingCents) })} />
        <InputField label={t('orderEdit.paymentValue')} value={paymentValue} onChangeText={(value) => setPaymentValue(formatMoneyInput(value))} keyboardType="numeric" placeholder="R$ 0,00" />
        <View style={styles.row}>
          {paymentMethods.map((item) => (
            <AppButton key={item} title={t(`orderEdit.payments.${item}`)} variant={paymentMethod === item ? 'primary' : 'secondary'} compact onPress={() => setPaymentMethod(item)} />
          ))}
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  option: { gap: spacing.xs, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  itemInfo: { flex: 1, gap: spacing.xxs },
  itemBlock: { borderTopWidth: 1, paddingTop: spacing.sm, marginTop: spacing.sm },
  compactFields: { flexDirection: 'row', gap: spacing.xs },
  compactInput: { minHeight: 42, paddingHorizontal: spacing.xs },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
});
