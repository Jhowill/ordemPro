import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

export default function SecuritySettingsScreen() {
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
    </ScreenContainer>
  );
}

