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
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { ServiceOrderStatus } from '@/types';
import { formatDate, formatMoney, statusLabel } from '@/utils/formatters';

const statusOptions: ServiceOrderStatus[] = ['open', 'diagnosis', 'waiting_approval', 'approved', 'in_progress', 'waiting_part', 'completed', 'delivered', 'cancelled'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const { t, locale } = useI18n();
  const { data, updateOrderStatus, addOrderPhoto, updateOrderPhoto, removeOrderPhoto, addSignature, removePayment } = useAppData();
  const [showCustomerSignaturePad, setShowCustomerSignaturePad] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ServiceOrderStatus | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const order = data.orders.find((item) => item.id === id);
  if (!order) return <ScreenContainer><EmptyState icon="alert-circle-outline" title={t('orderDetail.notFound')} description={t('orderDetail.notFoundDesc')} /></ScreenContainer>;
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
      Alert.alert(t('orderDetail.selectDifferentStatus'), t('orderDetail.changeSelectDesc'));
      return;
    }
    if (!statusNotes.trim()) {
      Alert.alert(t('orderDetail.changeRequired'), t('orderDetail.changeRequiredDesc'));
      return;
    }
    try {
      setSavingStatus(true);
      await updateOrderStatus(activeOrder.id, targetStatus, {
        reason: t('orderDetail.reasonLabel'),
        notes: statusNotes,
      });
      setSelectedStatus(null);
      setStatusNotes('');
      setShowStatusModal(false);
    } catch (error) {
      Alert.alert(t('orderDetail.statusUpdatedFail'), error instanceof Error ? error.message : t('common.retry'));
    } finally {
      setSavingStatus(false);
    }
  }

  function confirmRemovePayment(paymentId: string) {
    Alert.alert(t('orderDetail.removePayment'), t('orderDetail.removePaymentDesc'), [
      { text: t('common.back'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removePayment(paymentId);
          } catch (error) {
            Alert.alert(t('orderDetail.paymentRemovedFail'), error instanceof Error ? error.message : t('common.retry'));
          }
        },
      },
    ]);
  }

  async function addPhoto(source: 'library' | 'camera') {
    try {
      const image = await pickAndStoreImage('orders', source);
      if (!image) return;
      await addOrderPhoto(activeOrder.id, { localUri: image.localUri, caption: `Foto ${activeOrder.shortCode}`, includeInPdf: true });
    } catch (error) {
      Alert.alert(t('orderDetail.photoAddFail'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  async function addCustomerSignature(source: 'library' | 'camera') {
    try {
      const image = await pickAndStoreImage('signatures', source);
      if (!image) return;
      await addSignature(activeOrder.id, {
        kind: 'customer',
        localUri: image.localUri,
        signerName: customer?.name ?? t('common.customer'),
        signerDocument: customer?.document,
      });
    } catch (error) {
      Alert.alert(t('orderDetail.signatureAddFail'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  async function saveDrawnCustomerSignature(uri: string) {
    try {
      await addSignature(activeOrder.id, {
        kind: 'customer',
        localUri: uri,
        signerName: customer?.name ?? t('common.customer'),
        signerDocument: customer?.document,
      });
      setShowCustomerSignaturePad(false);
      setIsSigning(false);
    } catch (error) {
      Alert.alert(t('orderDetail.signatureSaveFail'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  return (
    <ScreenContainer scrollEnabled={!isSigning}>
      <AppHeader title={activeOrder.shortCode} subtitle={customer?.name ?? t('common.customer')} back action={<StatusBadge status={activeOrder.status} />} />
      <View style={styles.actions}>
        <AppButton title={t('orderDetail.title')} onPress={openStatusModal} />
        <AppButton title={t('orderEdit.title')} variant="secondary" onPress={() => router.push(`/orders/${activeOrder.id}/edit`)} />
        <AppButton title={t('pdf.title')} variant="secondary" onPress={() => router.push(`/orders/${activeOrder.id}/pdf`)} />
      </View>

      <Modal visible={showStatusModal} transparent animationType="fade" onRequestClose={closeStatusModal}>
        <View style={styles.modalRoot}>
          <Pressable style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]} onPress={closeStatusModal} />
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <AppCard>
              <SectionTitle title={t('orderDetail.title')} description={t('orderDetail.subtitle')} />
              <View style={styles.statusGrid}>
                {statusOptions.map((status) => {
                  const active = targetStatus === status;
                  return (
                    <View key={status} style={styles.statusChipWrap}>
                      <AppButton title={statusLabel(status, locale)} variant={active ? 'primary' : 'secondary'} compact onPress={() => setSelectedStatus(status)} />
                    </View>
                  );
                })}
              </View>
              <InputField
                label={t('orderDetail.changeDesc')}
                value={statusNotes}
                onChangeText={setStatusNotes}
                multiline
                style={styles.textArea}
                placeholder={t('orderDetail.changeDescPlaceholder')}
              />
              <View style={styles.statusFooter}>
                <AppText muted>{t('orderDetail.currentStatus', { status: statusLabel(activeOrder.status, locale) })}</AppText>
                <View style={styles.modalActions}>
                  <AppButton title={t('common.back')} variant="secondary" compact onPress={closeStatusModal} />
                  <AppButton title={t('orderDetail.save')} loading={savingStatus} compact onPress={saveStatusChange} />
                </View>
              </View>
            </AppCard>
          </View>
        </View>
      </Modal>

      <AppCard>
        <SectionTitle title={t('orderDetail.customer')} />
        <AppText>{customer?.name ?? '-'}</AppText>
        <AppText muted>{customer?.phone ?? customer?.whatsapp ?? '-'}</AppText>
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderDetail.equipment')} />
        <AppText>{equipment ? `${equipment.type ?? equipment.category} ${equipment.brand ?? ''} ${equipment.model ?? ''}` : t('common.serviceWithoutEquipment')}</AppText>
        <AppText muted>{equipment?.serialNumber ?? ''}</AppText>
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderDetail.issueAndDiagnosis')} description={`${t('common.technician')}: ${technician?.name ?? t('common.none')}`} />
        <AppText>{activeOrder.reportedIssue}</AppText>
        <AppText muted>{activeOrder.diagnosis || t('orderEdit.diagnosis')}</AppText>
        <AppText muted>{activeOrder.performedService || t('orderEdit.performedService')}</AppText>
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderDetail.serviceParts')} />
        <PaginatedList
          items={items}
          keyExtractor={(item) => item.id}
          empty={<AppText muted>{t('orderDetail.noItems')}</AppText>}
          renderItem={(item) => (
            <View key={item.id} style={styles.item}>
              <AppText style={{ flex: 1 }}>{item.description}</AppText>
              <AppText>{formatMoney(item.totalCents)}</AppText>
            </View>
          )}
        />
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderDetail.photos')} description={t('orderDetail.photosDesc', { count: photos.length, plural: photos.length === 1 ? '' : 's' })} />
        <View style={styles.actions}>
          <AppButton title={t('orderDetail.gallery')} variant="secondary" compact onPress={() => addPhoto('library')} />
          <AppButton title={t('orderDetail.camera')} variant="secondary" compact onPress={() => addPhoto('camera')} />
        </View>
        {photos.length ? (
          <View style={styles.photoGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image source={{ uri: photo.localUri }} style={[styles.photo, { backgroundColor: colors.surfaceAlt }]} />
                <AppText variant="caption" muted numberOfLines={1}>{photo.caption ?? t('orderDetail.photos')}</AppText>
                <AppButton title={photo.includeInPdf ? 'PDF' : t('common.close')} variant="secondary" compact onPress={() => updateOrderPhoto(photo.id, { includeInPdf: !photo.includeInPdf })} />
                <AppButton title={t('common.remove')} variant="danger" compact onPress={() => removeOrderPhoto(photo.id)} />
              </View>
            ))}
          </View>
        ) : (
          <AppText muted>{t('orderDetail.noPhotos')}</AppText>
        )}
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderDetail.signatures')} description={t('orderDetail.signaturesDesc')} />
        {showCustomerSignaturePad ? (
          <SignaturePad
            title={t('orderDetail.customerSignature')}
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
                <AppText variant="subtitle">{t('orderDetail.customerSignature')}</AppText>
                {customerSignature ? (
                  customerSignature.localUri.startsWith('data:image/svg+xml') ? <View style={[styles.signatureImage, { backgroundColor: colors.surfaceAlt }]}><AppText muted>{t('orderDetail.drawnSignature')}</AppText></View> : <Image source={{ uri: customerSignature.localUri }} style={[styles.signatureImage, { backgroundColor: colors.surfaceAlt }]} />
                ) : <AppText muted>{t('orderDetail.signed')}</AppText>}
              </View>
              <View style={styles.signatureBox}>
                <AppText variant="subtitle">{t('orderDetail.technicianSignature')}</AppText>
                {technician?.signatureUri ? (
                  technician.signatureUri.startsWith('data:image/svg+xml') ? <View style={[styles.signatureImage, { backgroundColor: colors.surfaceAlt }]}><AppText muted>{t('orderDetail.techProfileSignature')}</AppText></View> : <Image source={{ uri: technician.signatureUri }} style={[styles.signatureImage, { backgroundColor: colors.surfaceAlt }]} />
                ) : <AppText muted>{t('orderDetail.noTechSignature')}</AppText>}
              </View>
            </View>
            <View style={styles.signatureActions}>
              <View style={styles.signatureAction}>
                <AppButton title={t('orderDetail.signOnScreen')} variant="secondary" compact onPress={() => setShowCustomerSignaturePad(true)} />
              </View>
              <View style={styles.signatureAction}>
                <AppButton title={t('orderDetail.signLibrary')} variant="secondary" compact onPress={() => addCustomerSignature('library')} />
              </View>
              <View style={styles.signatureAction}>
                <AppButton title={t('orderDetail.signCamera')} variant="secondary" compact onPress={() => addCustomerSignature('camera')} />
              </View>
            </View>
          </>
        )}
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderDetail.finance')} />
        <View style={styles.item}><AppText>{t('orderDetail.serviceTotal')}</AppText><AppText>{formatMoney(activeOrder.laborTotalCents)}</AppText></View>
        <View style={styles.item}><AppText>{t('orderDetail.partsTotal')}</AppText><AppText>{formatMoney(activeOrder.partsTotalCents)}</AppText></View>
        <View style={styles.item}><AppText variant="subtitle">{t('orderDetail.total')}</AppText><AppText variant="subtitle">{formatMoney(activeOrder.totalCents)}</AppText></View>
        <View style={styles.item}><AppText>{t('orderDetail.paid')}</AppText><AppText>{formatMoney(activeOrder.paidCents)}</AppText></View>
        <View style={styles.item}><AppText>{t('orderDetail.pending')}</AppText><AppText>{formatMoney(activeOrder.pendingCents)}</AppText></View>
        <PaginatedList
          items={payments}
          keyExtractor={(payment) => payment.id}
          renderItem={(payment) => (
            <View key={payment.id} style={styles.paymentRow}>
              <View style={styles.itemInfo}>
                <AppText muted>{t('orderDetail.payment')}</AppText>
                <AppText muted>{formatMoney(payment.amountCents)}</AppText>
              </View>
              <AppButton title={t('common.remove')} variant="danger" compact onPress={() => confirmRemovePayment(payment.id)} />
            </View>
          )}
        />
      </AppCard>

      <AppCard>
        <SectionTitle title={t('orderDetail.history')} description={t('orderDetail.historyDesc')} />
        <PaginatedList
          items={statusHistory}
          keyExtractor={(history) => history.id}
          empty={<AppText muted>{t('orderDetail.noneHistory')}</AppText>}
          renderItem={(history) => (
            <View key={history.id} style={[styles.timelineItem, { borderLeftColor: colors.primary }]}>
              <AppText variant="subtitle">{statusLabel(history.toStatus, locale)}</AppText>
              <AppText muted>
                {history.fromStatus ? `${statusLabel(history.fromStatus, locale)} -> ` : ''}
                {formatDate(history.changedAt, locale)}
              </AppText>
              {history.notes ? <AppText muted>{history.notes}</AppText> : null}
              {history.reason ? <AppText muted>{t('orderDetail.statusReason', { reason: history.reason })}</AppText> : null}
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
  photo: { width: '100%', aspectRatio: 1, borderRadius: 8 },
  signatureRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  signatureBox: { flex: 1, gap: spacing.xs },
  signatureImage: { width: '100%', height: 80, resizeMode: 'contain', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  signatureActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  signatureAction: { flexGrow: 1, minWidth: '47%' },
});
