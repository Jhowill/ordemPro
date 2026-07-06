import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAppData } from '@/services/storage';

export default function PdfSettingsScreen() {
  const { data } = useAppData();
  return (
    <ScreenContainer>
      <AppHeader title="PDF e termos" subtitle="Modelo classico da V1" back />
      <AppCard>
        <AppText variant="subtitle">Configuracoes atuais</AppText>
        <AppText>Cor principal: {data.pdfSettings.primaryColor}</AppText>
        <AppText>Modelo: {data.pdfSettings.documentModel}</AppText>
        <AppText>Exibir valores: {data.pdfSettings.showValues ? 'Sim' : 'Nao'}</AppText>
        <AppText>Exibir assinaturas: {data.pdfSettings.showSignatures ? 'Sim' : 'Nao'}</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">Termos padrao</AppText>
        <AppText muted>{data.terms.warrantyText}</AppText>
        <AppText muted>{data.terms.serviceAuthorizationText}</AppText>
        <AppText muted>{data.terms.dataResponsibilityText}</AppText>
      </AppCard>
    </ScreenContainer>
  );
}

