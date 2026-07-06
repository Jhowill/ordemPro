import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { spacing } from '@/constants/theme';
import { useAppData } from '@/services/storage';

export default function CompanyOnboardingScreen() {
  const { data, saveCompany } = useAppData();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: data.company?.name ?? 'Tech Solutions Assistencia',
    tradeName: data.company?.tradeName ?? 'Tech Solutions',
    document: data.company?.document ?? '',
    responsibleName: data.company?.responsibleName ?? '',
    phone: data.company?.phone ?? '',
    whatsapp: data.company?.whatsapp ?? '',
    email: data.company?.email ?? '',
    addressLine: data.company?.addressLine ?? '',
    city: data.company?.city ?? '',
    state: data.company?.state ?? '',
    zipCode: data.company?.zipCode ?? '',
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function finish() {
    if (!form.name.trim() || (!form.phone.trim() && !form.whatsapp.trim())) {
      Alert.alert('Dados obrigatorios', 'Informe o nome da empresa e um telefone ou WhatsApp.');
      return;
    }
    await saveCompany(form);
    router.replace('/(tabs)');
  }

  return (
    <ScreenContainer
      footer={
        <View style={styles.footer}>
          {step > 0 ? <AppButton title="Voltar" variant="secondary" onPress={() => setStep((value) => value - 1)} /> : null}
          <AppButton title={step === 3 ? 'Ir para a Home' : 'Proximo'} onPress={() => (step === 3 ? finish() : setStep((value) => value + 1))} />
        </View>
      }
    >
      {step === 0 ? (
        <View style={styles.welcome}>
          <AppText variant="h1" style={styles.center}>OrdemPro</AppText>
          <AppText muted style={styles.center}>Crie ordens de servico profissionais mesmo sem internet.</AppText>
          <AppCard><AppText>Funciona 100% offline</AppText></AppCard>
          <AppCard><AppText>PDF profissional com logo e assinaturas</AppText></AppCard>
          <AppCard><AppText>Organize clientes, equipamentos, pecas e servicos</AppText></AppCard>
        </View>
      ) : null}

      {step === 1 ? (
        <>
          <AppHeader title="Dados da empresa" subtitle="Usados no cabecalho do PDF" />
          <InputField label="Nome da empresa" value={form.name} onChangeText={(value) => update('name', value)} />
          <InputField label="Nome fantasia" value={form.tradeName} onChangeText={(value) => update('tradeName', value)} />
          <InputField label="CPF/CNPJ" value={form.document} onChangeText={(value) => update('document', value)} />
          <InputField label="Responsavel" value={form.responsibleName} onChangeText={(value) => update('responsibleName', value)} />
          <InputField label="Telefone" value={form.phone} onChangeText={(value) => update('phone', value)} keyboardType="phone-pad" />
          <InputField label="WhatsApp" value={form.whatsapp} onChangeText={(value) => update('whatsapp', value)} keyboardType="phone-pad" />
          <InputField label="E-mail" value={form.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <AppHeader title="Endereco e logo" subtitle="Campos opcionais para enriquecer o PDF" />
          <AppCard>
            <AppText variant="subtitle">Logo da empresa</AppText>
            <AppText muted>Selecao de imagem fica preparada para a etapa de midia. O PDF ja funciona sem logo.</AppText>
          </AppCard>
          <InputField label="Endereco" value={form.addressLine} onChangeText={(value) => update('addressLine', value)} />
          <InputField label="Cidade" value={form.city} onChangeText={(value) => update('city', value)} />
          <InputField label="Estado" value={form.state} onChangeText={(value) => update('state', value)} />
          <InputField label="CEP" value={form.zipCode} onChangeText={(value) => update('zipCode', value)} />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <AppHeader title="Conclusao" subtitle="Empresa pronta para gerar OS" />
          <AppCard>
            <SectionTitle title="Resumo" />
            <AppText variant="subtitle">{form.name}</AppText>
            <AppText muted>{form.phone || form.whatsapp}</AppText>
            <AppText muted>{form.city ? `${form.city}/${form.state}` : 'Endereco opcional'}</AppText>
          </AppCard>
          <AppCard>
            <AppText variant="subtitle">Termos padrao configurados</AppText>
            <AppText muted>Garantia, autorizacao de servico, retirada e responsabilidade sobre dados podem ser ajustados depois.</AppText>
          </AppCard>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  welcome: { gap: spacing.md, paddingTop: spacing['3xl'] },
  center: { textAlign: 'center' },
  footer: { flexDirection: 'row', gap: spacing.sm },
});

