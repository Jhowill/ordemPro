import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';
import { CatalogPart, CatalogService, OrderItemType, PaymentMethod, ServiceOrderPriority } from '@/types';
import { formatMoney, formatMoneyInput, makeId, moneyFromText } from '@/utils/formatters';

type DraftItem = { id: string; type: OrderItemType; description: string; quantity: number; unitPriceCents: number; discountCents: number };

const priorities: ServiceOrderPriority[] = ['low', 'normal', 'high', 'urgent'];
const paymentMethods: PaymentMethod[] = ['cash', 'pix', 'debit_card', 'credit_card', 'bank_transfer', 'other'];

const priorityLabel: Record<ServiceOrderPriority, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

const paymentLabel: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  pix: 'Pix',
  debit_card: 'Debito',
  credit_card: 'Credito',
  bank_transfer: 'Transferencia',
  other: 'Outro',
};

export default function EditOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updateOrder, replaceOrderItems, addPayment } = useAppData();
  const colors = useThemeColors();
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

  if (!order) return <ScreenContainer><EmptyState icon="alert-circle-outline" title="OS nao encontrada" description="Nao foi possivel editar esta ordem." /></ScreenContainer>;
  const activeOrder = order;

  async function save() {
    if (!reportedIssue.trim()) {
      Alert.alert('Informe o problema ou servico solicitado.');
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
      await replaceOrderItems(activeOrder.id, items);
      const amountCents = moneyFromText(paymentValue);
      if (amountCents > 0) {
        await addPayment(activeOrder.id, { amountCents, method: paymentMethod, paidAt: new Date().toISOString() });
      }
      router.back();
    } catch (error) {
      Alert.alert('Erro ao salvar OS', error instanceof Error ? error.message : 'Tente novamente.');
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

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  const itemsTotal = items.reduce((sum, item) => sum + Math.max(0, item.quantity * item.unitPriceCents - item.discountCents), 0);

  return (
    <ScreenContainer footer={<AppButton title="Salvar alteracoes" loading={saving} onPress={save} />}>
      <AppHeader title="Editar OS" subtitle={activeOrder.shortCode} back />

      <AppCard>
        <SectionTitle title="Tecnico" />
        {data.technicians.map((technician) => (
          <Pressable key={technician.id} onPress={() => setTechnicianId(technician.id)} style={styles.option}>
            <AppText variant="subtitle" color={technicianId === technician.id ? colors.primary : undefined}>{technician.name}</AppText>
            <AppText muted>{technician.signatureUri ? 'Assinatura pronta para PDF' : 'Sem assinatura no perfil'}</AppText>
          </Pressable>
        ))}
        <AppButton title="Gerenciar tecnico" variant="secondary" compact onPress={() => router.push('/settings/technician')} />
      </AppCard>

      <AppCard>
        <SectionTitle title="Dados tecnicos" />
        <InputField label="Problema relatado" value={reportedIssue} onChangeText={setReportedIssue} multiline style={styles.textArea} />
        <InputField label="Diagnostico" value={diagnosis} onChangeText={setDiagnosis} multiline style={styles.textArea} />
        <InputField label="Servico executado" value={performedService} onChangeText={setPerformedService} multiline style={styles.textArea} />
        <InputField label="Previsao ISO ou data livre" value={expectedCompletionAt} onChangeText={setExpectedCompletionAt} />
        <InputField label="Garantia em dias" value={warrantyDays} onChangeText={setWarrantyDays} keyboardType="numeric" />
      </AppCard>

      <AppCard>
        <SectionTitle title="Prioridade e aprovacao" />
        <View style={styles.row}>
          {priorities.map((item) => (
            <AppButton key={item} title={priorityLabel[item]} variant={priority === item ? 'primary' : 'secondary'} compact onPress={() => setPriority(item)} />
          ))}
        </View>
        <AppButton title={approved ? 'Aprovado pelo cliente' : 'Marcar como aprovado'} variant={approved ? 'primary' : 'secondary'} onPress={() => setApproved((value) => !value)} />
      </AppCard>

      <AppCard>
        <SectionTitle title="Pecas e servicos" description={`Total dos itens: ${formatMoney(itemsTotal)}`} />
        <SectionTitle title="Catalogo de servicos" />
        {data.services.map((service) => (
          <View key={service.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <AppText variant="subtitle">{service.name}</AppText>
              <AppText muted>{service.category ?? 'Servico'} - {formatMoney(service.defaultPriceCents)}</AppText>
            </View>
            <AppButton title="Adicionar" variant="secondary" compact onPress={() => addCatalogService(service)} />
          </View>
        ))}
        <SectionTitle title="Catalogo de pecas" />
        {data.parts.map((part) => (
          <View key={part.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <AppText variant="subtitle">{part.name}</AppText>
              <AppText muted>{part.category ?? 'Peca'} - {formatMoney(part.salePriceCents)}</AppText>
            </View>
            <AppButton title="Adicionar" variant="secondary" compact onPress={() => addCatalogPart(part)} />
          </View>
        ))}
        <SectionTitle title="Item manual" />
        <InputField label="Descricao" value={manualItem.description} onChangeText={(value) => setManualItem((current) => ({ ...current, description: value }))} />
        <InputField label="Valor" value={manualItem.price} onChangeText={(value) => setManualItem((current) => ({ ...current, price: formatMoneyInput(value) }))} keyboardType="numeric" />
        <View style={styles.row}>
          <AppButton title="Servico" variant="secondary" compact onPress={() => addManualItem('service')} />
          <AppButton title="Peca" variant="secondary" compact onPress={() => addManualItem('part')} />
        </View>
        <SectionTitle title="Itens da OS" />
        {items.map((item) => (
          <View key={item.id} style={styles.itemBlock}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <AppText variant="subtitle">{item.description}</AppText>
                <AppText muted>{item.type === 'service' ? 'Servico' : 'Peca'} - Total {formatMoney(Math.max(0, item.quantity * item.unitPriceCents - item.discountCents))}</AppText>
              </View>
              <AppButton title="Retirar" variant="danger" compact onPress={() => removeItem(item.id)} />
            </View>
            <View style={styles.compactFields}>
              <InputField label="Qtd" value={String(item.quantity)} onChangeText={(value) => updateItem(item.id, { quantity: Math.max(1, Number(value.replace(/\D/g, '') || 1)) })} keyboardType="numeric" style={styles.compactInput} />
              <InputField label="Valor" value={formatMoney(item.unitPriceCents)} onChangeText={(value) => updateItem(item.id, { unitPriceCents: moneyFromText(value) })} keyboardType="numeric" style={styles.compactInput} />
              <InputField label="Desc." value={formatMoney(item.discountCents)} onChangeText={(value) => updateItem(item.id, { discountCents: moneyFromText(value) })} keyboardType="numeric" style={styles.compactInput} />
            </View>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <SectionTitle title="Pagamento" description={`Pendente atual: ${formatMoney(activeOrder.pendingCents)}`} />
        <InputField label="Valor recebido" value={paymentValue} onChangeText={(value) => setPaymentValue(formatMoneyInput(value))} keyboardType="numeric" placeholder="R$ 0,00" />
        <View style={styles.row}>
          {paymentMethods.map((item) => (
            <AppButton key={item} title={paymentLabel[item]} variant={paymentMethod === item ? 'primary' : 'secondary'} compact onPress={() => setPaymentMethod(item)} />
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
  itemBlock: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: spacing.sm, marginTop: spacing.sm },
  compactFields: { flexDirection: 'row', gap: spacing.xs },
  compactInput: { minHeight: 42, paddingHorizontal: spacing.xs },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
});
