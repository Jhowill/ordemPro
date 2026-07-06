import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { buildOrderPdfHtml } from '@/services/pdfTemplate';
import { useAppData } from '@/services/storage';
import { ServiceOrderPdf } from '@/types';
import { formatDate, formatMoney, makeId, nowIso } from '@/utils/formatters';

export default function OrderPdfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updatePdfRecord } = useAppData();
  const [loading, setLoading] = useState(false);
  const order = data.orders.find((item) => item.id === id);
  const pdf = data.pdfs.find((item) => item.orderId === id);

  if (!order) return <ScreenContainer><EmptyState icon="document-outline" title="OS nao encontrada" description="Nao foi possivel abrir o PDF." /></ScreenContainer>;
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
      const html = buildOrderPdfHtml(data, activeOrder);
      const result = await Print.printToFileAsync({ html, base64: false });
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
      Alert.alert('PDF gerado', 'O arquivo foi salvo localmente.');
    } catch (error) {
      Alert.alert('Erro ao gerar PDF', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function share() {
    const latest = data.pdfs.find((item) => item.orderId === id);
    if (!latest) {
      Alert.alert('Gere o PDF antes de compartilhar.');
      return;
    }
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Compartilhamento indisponivel neste dispositivo.');
      return;
    }
    await Sharing.shareAsync(latest.localUri);
  }

  return (
    <ScreenContainer>
      <AppHeader title="PDF da OS" subtitle={activeOrder.shortCode} back />
      <AppCard>
        <AppText variant="subtitle">{pdf ? 'PDF gerado' : 'Nenhum PDF gerado'}</AppText>
        <AppText muted>{pdf ? `Versao ${pdf.version} - ${formatDate(pdf.generatedAt)}` : 'Gere o documento profissional para enviar ao cliente.'}</AppText>
        {activeOrder.isPdfOutdated ? <AppText color="#F59E0B">A OS foi alterada depois da ultima geracao.</AppText> : null}
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">Previa do conteudo</AppText>
        <AppText>Cliente: {customer?.name ?? '-'}</AppText>
        <AppText>Equipamento: {equipment ? `${equipment.type ?? equipment.category} ${equipment.brand ?? ''} ${equipment.model ?? ''}` : 'Servico sem equipamento'}</AppText>
        <AppText>Tecnico: {technician?.name ?? data.company?.responsibleName ?? '-'}</AppText>
        <AppText>Total: {formatMoney(activeOrder.totalCents)}</AppText>
        <AppText muted>{items.length} itens, {photos.length} fotos no PDF, {signatures.length} assinatura(s)</AppText>
      </AppCard>
      <AppButton title={pdf ? 'Regenerar PDF' : 'Gerar PDF'} loading={loading} onPress={generate} />
      <AppButton title="Compartilhar PDF" variant="secondary" onPress={share} />
    </ScreenContainer>
  );
}
