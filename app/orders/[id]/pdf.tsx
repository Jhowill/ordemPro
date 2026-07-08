import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { imageUriToDataUri } from '@/services/media';
import { buildOrderPdfHtml, PDF_PAGE_MARGINS } from '@/services/pdfTemplate';
import { useAppData } from '@/services/storage';
import { AppData, ServiceOrderPdf } from '@/types';
import { formatDate, formatMoney, makeId, nowIso } from '@/utils/formatters';

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

async function preparePdfData(data: AppData, orderId: string): Promise<AppData> {
  const [logoUri, photos, technicians, signatures] = await Promise.all([
    imageUriToDataUri(data.company?.logoUri),
    Promise.all(data.photos.map(async (photo) => {
      if (photo.orderId !== orderId) return photo;
      const localUri = await imageUriToDataUri(photo.localUri);
      return localUri ? { ...photo, localUri } : null;
    })),
    Promise.all(data.technicians.map(async (technician) => {
      if (!technician.signatureUri) return technician;
      const signatureUri = await imageUriToDataUri(technician.signatureUri);
      return { ...technician, signatureUri: signatureUri ?? undefined };
    })),
    Promise.all(data.signatures.map(async (signature) => {
      if (signature.orderId !== orderId) return signature;
      const localUri = await imageUriToDataUri(signature.localUri);
      return localUri ? { ...signature, localUri } : null;
    })),
  ]);

  return {
    ...data,
    company: data.company ? { ...data.company, logoUri } : data.company,
    photos: photos.filter(isDefined),
    technicians,
    signatures: signatures.filter(isDefined),
  };
}

export default function OrderPdfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updatePdfRecord } = useAppData();
  const colors = useThemeColors();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const order = data.orders.find((item) => item.id === id);
  const pdf = data.pdfs.find((item) => item.orderId === id);

  if (!order) return <ScreenContainer><EmptyState icon="document-outline" title={t('orderDetail.notFound')} description={t('orderDetail.notFoundDesc')} /></ScreenContainer>;
  const activeOrder = order;
  const customer = data.customers.find((item) => item.id === activeOrder.customerId);
  const equipment = data.equipments.find((item) => item.id === activeOrder.equipmentId);
  const technician = data.technicians.find((item) => item.id === activeOrder.technicianId);
  const items = data.items.filter((item) => item.orderId === activeOrder.id);
  const photos = data.photos.filter((item) => item.orderId === activeOrder.id && item.includeInPdf);
  const signatures = data.signatures.filter((item) => item.orderId === activeOrder.id);

  async function generate() {
    try {
      setLoading(true);
      const pdfData = await preparePdfData(data, activeOrder.id);
      const html = buildOrderPdfHtml(pdfData, activeOrder, { useBodyMargins: Platform.OS !== 'ios' });
      const result = await Print.printToFileAsync({
        html,
        base64: false,
        ...(Platform.OS === 'ios' ? { margins: PDF_PAGE_MARGINS } : {}),
      });
      const record: ServiceOrderPdf = {
        id: makeId('pdf'),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        orderId: activeOrder.id,
        version: (pdf?.version ?? 0) + 1,
        localUri: result.uri,
        generatedAt: nowIso(),
        totalCents: activeOrder.totalCents,
        snapshotJson: JSON.stringify({
          locale: data.locale,
          order: activeOrder,
          customer: data.customers.find((item) => item.id === activeOrder.customerId),
          equipment: data.equipments.find((item) => item.id === activeOrder.equipmentId),
          technician: data.technicians.find((item) => item.id === activeOrder.technicianId),
          items: data.items.filter((item) => item.orderId === activeOrder.id),
          payments: data.payments.filter((item) => item.orderId === activeOrder.id),
          photos: data.photos.filter((item) => item.orderId === activeOrder.id),
          signatures: data.signatures.filter((item) => item.orderId === activeOrder.id),
        }),
      };
      await updatePdfRecord(record);
      Alert.alert(t('pdf.updated'), t('pdf.updatedDesc'));
    } catch (error) {
      Alert.alert(t('pdf.saveFail'), error instanceof Error ? error.message : t('common.retry'));
    } finally {
      setLoading(false);
    }
  }

  async function share() {
    try {
      const latest = data.pdfs.find((item) => item.orderId === id);
      if (!latest) {
        Alert.alert(t('pdf.shareBefore'));
        return;
      }
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(t('pdf.shareUnavailable'));
        return;
      }
      await Sharing.shareAsync(latest.localUri);
    } catch (error) {
      Alert.alert(t('pdf.shareFail'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title={t('pdf.title')} subtitle={activeOrder.shortCode} back />
      <AppCard>
        <AppText variant="subtitle">{pdf ? t('pdf.title') : t('pdf.updated')}</AppText>
        <AppText muted>{pdf ? `V${pdf.version} - ${formatDate(pdf.generatedAt, data.locale)}` : t('pdf.updatedDesc')}</AppText>
        {activeOrder.isPdfOutdated ? <AppText color={colors.warning}>{t('orderDetail.selectDifferentStatus')}</AppText> : null}
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">{t('orderNew.summaryTitle')}</AppText>
        <AppText>{t('details.customerTitle')}: {customer?.name ?? '-'}</AppText>
        <AppText>{t('details.equipmentTitle')}: {equipment ? `${equipment.type ?? equipment.category} ${equipment.brand ?? ''} ${equipment.model ?? ''}` : t('common.serviceWithoutEquipment')}</AppText>
        <AppText>{t('common.technician')}: {technician?.name ?? data.company?.responsibleName ?? '-'}</AppText>
        <AppText>{t('orderDetail.total')}: {formatMoney(activeOrder.totalCents)}</AppText>
        <AppText muted>{t('pdf.summaryCounts', { items: items.length, photos: photos.length, signatures: signatures.length })}</AppText>
      </AppCard>
      <AppButton title={pdf ? t('pdf.updated') : t('pdf.title')} loading={loading} onPress={generate} />
      <AppButton title={t('pdf.share')} variant="secondary" onPress={share} />
    </ScreenContainer>
  );
}
