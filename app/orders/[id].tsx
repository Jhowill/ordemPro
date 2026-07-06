import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/theme';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { ServiceOrderStatus } from '@/types';
import { formatDate, formatMoney, statusLabel } from '@/utils/formatters';

const nextStatuses: ServiceOrderStatus[] = ['diagnosis', 'waiting_approval', 'approved', 'in_progress', 'waiting_part', 'completed', 'delivered'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updateOrderStatus, addOrderPhoto, updateOrderPhoto, removeOrderPhoto, addSignature } = useAppData();
  const [showCustomerSignaturePad, setShowCustomerSignaturePad] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
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
        <AppButton title={activeOrder.status === 'delivered' ? 'Ver PDF' : 'Avancar status'} onPress={activeOrder.status === 'delivered' ? () => router.push(`/orders/${activeOrder.id}/pdf`) : advanceStatus} />
        <AppButton title="Editar" variant="secondary" onPress={() => router.push(`/orders/${activeOrder.id}/edit`)} />
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
        <SectionTitle title="Problema e diagnostico" description={`Tecnico: ${technician?.name ?? 'Nao informado'}`} />
        <AppText>{activeOrder.reportedIssue}</AppText>
        <AppText muted>{activeOrder.diagnosis || 'Diagnostico ainda nao informado.'}</AppText>
        <AppText muted>{activeOrder.performedService || 'Servico executado ainda nao informado.'}</AppText>
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
            <View style={styles.actions}>
              <AppButton title="Assinar na tela" variant="secondary" compact onPress={() => setShowCustomerSignaturePad(true)} />
              <AppButton title="Assinar galeria" variant="secondary" compact onPress={() => addCustomerSignature('library')} />
              <AppButton title="Assinar camera" variant="secondary" compact onPress={() => addCustomerSignature('camera')} />
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
        {payments.map((payment) => (
          <View key={payment.id} style={styles.item}><AppText muted>Pagamento</AppText><AppText muted>{formatMoney(payment.amountCents)}</AppText></View>
        ))}
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
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  photoItem: { width: '47%', gap: spacing.xs },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#E5E7EB' },
  signatureRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  signatureBox: { flex: 1, gap: spacing.xs },
  signatureImage: { width: '100%', height: 80, resizeMode: 'contain', borderRadius: 8, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
});
