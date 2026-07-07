import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAppData } from '@/services/storage';

export default function SecuritySettingsScreen() {
  const { clearAllData } = useAppData();
  const [clearing, setClearing] = useState(false);

  async function handleClearData() {
    try {
      setClearing(true);
      await clearAllData();
      Alert.alert('Dados limpos', 'O OrdemPro foi zerado neste aparelho.');
      router.replace('/onboarding/company');
    } catch (error) {
      Alert.alert('Nao foi possivel limpar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setClearing(false);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title="Seguranca" subtitle="Preparado para V1.1" back />
      <AppCard>
        <AppText variant="subtitle">Bloqueio local</AppText>
        <AppText muted>PIN e biometria estao previstos no modelo, mas ficam fora do primeiro corte funcional para nao atrasar o fluxo principal.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">Privacidade</AppText>
        <AppText muted>Os dados ficam no aparelho. Compartilhamento e backup acontecem somente por acao do usuario.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">Limpar dados do app</AppText>
        <AppText muted>Apaga empresa, clientes, equipamentos, OS, fotos, assinaturas, PDFs e backups locais deste aparelho.</AppText>
        <HoldToConfirmButton
          title="Segure por 3s para limpar tudo"
          holdTitle="Continue segurando para confirmar"
          loading={clearing}
          onConfirm={handleClearData}
        />
      </AppCard>
    </ScreenContainer>
  );
}
