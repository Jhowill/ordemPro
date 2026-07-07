import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { InputField } from '@/components/ui/InputField';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { ServiceOrderStatus } from '@/types';
import { formatDate, formatMoney, statusLabel } from '@/utils/formatters';

const statusOptions: ServiceOrderStatus[] = ['open', 'diagnosis', 'waiting_approval', 'approved', 'in_progress', 'waiting_part', 'completed', 'delivered', 'cancelled'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const { data, updateOrderStatus, addOrderPhoto, updateOrderPhoto, removeOrderPhoto, addSignature, removePayment } = useAppData();
  const [showCustomerSignaturePad, setShowCustomerSignaturePad] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ServiceOrderStatus | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const order = data.orders.find((item) => item.id === id);
  if (!order) return <ScreenContainer><EmptyState icon="alert-circle-outline" title="OS nao encontrada" description="A ordem pode ter sido removida." /></ScreenContainer>;
  const activeOrder = order;
  const customer = data.customers.find((item) => item.id === activeOrder.customerId);
  const equipment = data.equipments.find((item) => item.id === activeOrder.equipmentId);
  const technician = data.technicians.find((item) => item.id === activeOrder.technicianId) ?? data.technicians.find((item) => item.isDefault);
  const items = data.items.filter((item) => item.orderId === activeOrder.id);
  const payments = data.payments.filter((item) => item.orderId === activeOrder.id);
  const photos = data.photos.filter((item) => item.orderId === activeOrder.id);
  const customerSignature = data.signatures.find((item) => item.orderId === activeOrder.id && item.kind === 'customer');
  const statusHistory = data.statusHistory.filter((item) => item.orderId === activeOrder.id);

  const targetStatus = selectedStatus ?? activeOrder.status;

  function openStatusModal() {
    setSelectedStatus(activeOrder.status);
    setStatusNotes('');
    setShowStatusModal(true);
  }

  function closeStatusModal() {
    if (savingStatus) return;
    setSelectedStatus(null);
    setStatusNotes('');
    setShowStatusModal(false);
  }

  async function saveStatusChange() {
    if (targetStatus === activeOrder.status) {
      Alert.alert('Selecione outro status', 'Escolha um status diferente do atual para salvar a mudanca.');
      return;
    }
    if (!statusNotes.trim()) {
      Alert.alert('Descreva a mudanca', 'Informe uma descricao antes de salvar o novo status.');
      return;
    }
    try {
      setSavingStatus(true);
      await updateOrderStatus(activeOrder.id, targetStatus, {
        reason: 'Alteracao manual',
        notes: statusNotes,
      });
      setSelectedStatus(null);
      setStatusNotes('');
      setShowStatusModal(false);
    } finally {
      setSavingStatus(false);
    }
  }

  function confirmRemovePayment(paymentId: string) {
    Alert.alert('Remover pagamento', 'Deseja retirar este pagamento da OS?', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removePayment(paymentId) },
    ]);
  }

  async function addPhoto(source: 'library' | 'camera') {
    try {
      const image = await pickAndStoreImage('orders', source);
      if (!image) return;
      await addOrderPhoto(activeOrder.id, { localUri: image.localUri, caption: `Foto da ${activeOrder.shortCode}`, includeInPdf: true });
    } catch (error) {
      Alert.alert('Foto nao adicionada', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  async function addCustomerSignature(source: 'library' | 'camera') {
    try {
      const image = await pickAndStoreImage('signatures', source);
      if (!image) return;
      await addSignature(activeOrder.id, {
        kind: 'customer',
        localUri: image.localUri,
        signerName: customer?.name ?? 'Cliente',
        signerDocument: customer?.document,
      });
    } catch (error) {
      Alert.alert('Assinatura nao adicionada', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  async function saveDrawnCustomerSignature(uri: string) {
    await addSignature(activeOrder.id, {
      kind: 'customer',
      localUri: uri,
      signerName: customer?.name ?? 'Cliente',
      signerDocument: customer?.document,
    });
    setShowCustomerSignaturePad(false);
    setIsSigning(false);
  }

  return (
    <ScreenContainer scrollEnabled={!isSigning}>
      <AppHeader title={activeOrder.shortCode} subtitle={customer?.name ?? 'Cliente'} back action={<StatusBadge status={activeOrder.status} />} />
      <View style={styles.actions}>
        <AppButton title="Alterar status" onPress={openStatusModal} />
        <AppButton title="Editar" variant="secondary" onPress={() => router.push(`/orders/${activeOrder.id}/edit`)} />
        <AppButton title="PDF" variant="secondary" onPress={() => router.push(`/orders/${activeOrder.id}/pdf`)} />
      </View>

      <Modal visible={showStatusModal} transparent animationType="fade" onRequestClose={closeStatusModal}>
        <View style={styles.modalRoot}>
          <Pressable style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]} onPress={closeStatusModal} />
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <AppCard>
              <SectionTitle title="Alterar status" description="Selecione o novo estado e registre o motivo da mudanca" />
              <View style={styles.statusGrid}>
                {statusOptions.map((status) => {
                  const active = targetStatus === status;
                  return (
                    <View key={status} style={styles.statusChipWrap}>
                      <AppButton
                        title={statusLabel(status)}
                        variant={active ? 'primary' : 'secondary'}
                        compact
                        onPress={() => setSelectedStatus(status)}
                      />
                    </View>
                  );
                })}
              </View>
              <InputField
                label="Descricao da mudanca"
                value={statusNotes}
                onChangeText={setStatusNotes}
                multiline
                style={styles.textArea}
                placeholder="Ex.: Cliente aprovou o orcamento, aguardando chegada da peca."
              />
              <View style={styles.statusFooter}>
                <AppText muted>Status atual: {statusLabel(activeOrder.status)}</AppText>
                <View style={styles.modalActions}>
                  <AppButton title="Voltar" variant="secondary" compact onPress={closeStatusModal} />
                  <AppButton title="Salvar" loading={savingStatus} compact onPress={saveStatusChange} />
                </View>
              </View>
            </AppCard>
          </View>
        </View>
      </Modal>

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
        <SectionTitle title="Problema e diagnostico" description={`Tecnico: ${technician?.name ?? 'Nao informado'}`} />
        <AppText>{activeOrder.reportedIssue}</AppText>
        <AppText muted>{activeOrder.diagnosis || 'Diagnostico ainda nao informado.'}</AppText>
        <AppText muted>{activeOrder.performedService || 'Servico executado ainda nao informado.'}</AppText>
      </AppCard>

      <AppCard>
        <SectionTitle title="Pecas e servicos" />
        <PaginatedList
          items={items}
          keyExtractor={(item) => item.id}
          empty={<AppText muted>Nenhum item adicionado.</AppText>}
          renderItem={(item) => (
            <View key={item.id} style={styles.item}>
              <AppText style={{ flex: 1 }}>{item.description}</AppText>
              <AppText>{formatMoney(item.totalCents)}</AppText>
            </View>
          )}
        />
      </AppCard>

      <AppCard>
        <SectionTitle title="Fotos da OS" description={`${photos.length} foto${photos.length === 1 ? '' : 's'} salva${photos.length === 1 ? '' : 's'} localmente`} />
        <View style={styles.actions}>
          <AppButton title="Galeria" variant="secondary" compact onPress={() => addPhoto('library')} />
          <AppButton title="Camera" variant="secondary" compact onPress={() => addPhoto('camera')} />
        </View>
        {photos.length ? (
          <View style={styles.photoGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image source={{ uri: photo.localUri }} style={styles.photo} />
                <AppText variant="caption" muted numberOfLines={1}>{photo.caption ?? 'Foto da OS'}</AppText>
                <AppButton title={photo.includeInPdf ? 'No PDF' : 'Oculta'} variant="secondary" compact onPress={() => updateOrderPhoto(photo.id, { includeInPdf: !photo.includeInPdf })} />
                <AppButton title="Remover" variant="danger" compact onPress={() => removeOrderPhoto(photo.id)} />
              </View>
            ))}
          </View>
        ) : (
          <AppText muted>Nenhuma foto adicionada ainda.</AppText>
        )}
      </AppCard>

      <AppCard>
        <SectionTitle title="Assinaturas" description="Assinaturas usadas no PDF" />
        {showCustomerSignaturePad ? (
          <SignaturePad
            title="Assinatura do cliente"
            onSigningChange={setIsSigning}
            onSave={saveDrawnCustomerSignature}
            onCancel={() => {
              setShowCustomerSignaturePad(false);
              setIsSigning(false);
            }}
          />
        ) : (
          <>
            <View style={styles.signatureRow}>
              <View style={styles.signatureBox}>
                <AppText variant="subtitle">Cliente</AppText>
                {customerSignature ? (
                  customerSignature.localUri.startsWith('data:image/svg+xml') ? <View style={styles.signatureImage}><AppText muted>Assinatura desenhada salva.</AppText></View> : <Image source={{ uri: customerSignature.localUri }} style={styles.signatureImage} />
                ) : <AppText muted>Nao assinou.</AppText>}
              </View>
              <View style={styles.signatureBox}>
                <AppText variant="subtitle">Tecnico</AppText>
                {technician?.signatureUri ? (
                  technician.signatureUri.startsWith('data:image/svg+xml') ? <View style={styles.signatureImage}><AppText muted>Assinatura do perfil salva.</AppText></View> : <Image source={{ uri: technician.signatureUri }} style={styles.signatureImage} />
                ) : <AppText muted>Sem assinatura no perfil.</AppText>}
              </View>
            </View>
            <View style={styles.signatureActions}>
              <View style={styles.signatureAction}>
                <AppButton title="Assinar na tela" variant="secondary" compact onPress={() => setShowCustomerSignaturePad(true)} />
              </View>
              <View style={styles.signatureAction}>
                <AppButton title="Assinar galeria" variant="secondary" compact onPress={() => addCustomerSignature('library')} />
              </View>
              <View style={styles.signatureAction}>
                <AppButton title="Assinar camera" variant="secondary" compact onPress={() => addCustomerSignature('camera')} />
              </View>
            </View>
          </>
        )}
      </AppCard>

      <AppCard>
        <SectionTitle title="Resumo financeiro" />
        <View style={styles.item}><AppText>Servicos</AppText><AppText>{formatMoney(activeOrder.laborTotalCents)}</AppText></View>
        <View style={styles.item}><AppText>Pecas</AppText><AppText>{formatMoney(activeOrder.partsTotalCents)}</AppText></View>
        <View style={styles.item}><AppText variant="subtitle">Total</AppText><AppText variant="subtitle">{formatMoney(activeOrder.totalCents)}</AppText></View>
        <View style={styles.item}><AppText>Pago</AppText><AppText>{formatMoney(activeOrder.paidCents)}</AppText></View>
        <View style={styles.item}><AppText>Pendente</AppText><AppText>{formatMoney(activeOrder.pendingCents)}</AppText></View>
        <PaginatedList
          items={payments}
          keyExtractor={(payment) => payment.id}
          renderItem={(payment) => (
            <View key={payment.id} style={styles.paymentRow}>
              <View style={styles.itemInfo}>
                <AppText muted>Pagamento</AppText>
                <AppText muted>{formatMoney(payment.amountCents)}</AppText>
              </View>
              <AppButton title="Remover" variant="danger" compact onPress={() => confirmRemovePayment(payment.id)} />
            </View>
          )}
        />
      </AppCard>

      <AppCard>
        <SectionTitle title="Historico de status" description="Registro local salvo no SQLite" />
        <PaginatedList
          items={statusHistory}
          keyExtractor={(history) => history.id}
          empty={<AppText muted>Nenhuma alteracao registrada ainda.</AppText>}
          renderItem={(history) => (
            <View key={history.id} style={styles.timelineItem}>
              <AppText variant="subtitle">{statusLabel(history.toStatus)}</AppText>
              <AppText muted>
                {history.fromStatus ? `${statusLabel(history.fromStatus)} -> ` : ''}
                {formatDate(history.changedAt)}
              </AppText>
              {history.notes ? <AppText muted>{history.notes}</AppText> : null}
              {history.reason ? <AppText muted>Motivo: {history.reason}</AppText> : null}
            </View>
          )}
        />
      </AppCard>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  statusChipWrap: { flexGrow: 1, minWidth: '47%' },
  statusFooter: { gap: spacing.sm },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalSheet: { padding: spacing.md, paddingBottom: spacing.lg, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  textArea: { minHeight: 84, textAlignVertical: 'top' },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.xs },
  itemInfo: { flex: 1 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginTop: spacing.sm },
  timelineItem: { borderLeftWidth: 2, paddingLeft: spacing.sm, marginBottom: spacing.sm },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  photoItem: { width: '47%', gap: spacing.xs },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#E5E7EB' },
  signatureRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  signatureBox: { flex: 1, gap: spacing.xs },
  signatureImage: { width: '100%', height: 80, resizeMode: 'contain', borderRadius: 8, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  signatureActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  signatureAction: { flexGrow: 1, minWidth: '47%' },
});
