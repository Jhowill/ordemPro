import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { formatCpfCnpjInput, formatPhoneInput } from '@/utils/formatters';

export default function CompanyOnboardingScreen() {
  const { data, saveCompany, saveTerms } = useAppData();
  const colors = useThemeColors();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: data.company?.name ?? 'Tech Solutions Assistencia',
    tradeName: data.company?.tradeName ?? 'Tech Solutions',
    document: formatCpfCnpjInput(data.company?.document ?? ''),
    responsibleName: data.company?.responsibleName ?? '',
    phone: formatPhoneInput(data.company?.phone ?? ''),
    whatsapp: formatPhoneInput(data.company?.whatsapp ?? ''),
    email: data.company?.email ?? '',
    addressLine: data.company?.addressLine ?? '',
    city: data.company?.city ?? '',
    state: data.company?.state ?? '',
    zipCode: data.company?.zipCode ?? '',
    logoUri: data.company?.logoUri ?? '',
  });
  const [terms, setTerms] = useState({
    warrantyText: data.terms.warrantyText,
    serviceAuthorizationText: data.terms.serviceAuthorizationText,
    withdrawalText: data.terms.withdrawalText,
    dataResponsibilityText: data.terms.dataResponsibilityText,
    unclaimedEquipmentText: data.terms.unclaimedEquipmentText,
  });
  const [enabledTerms, setEnabledTerms] = useState({
    warrantyText: true,
    serviceAuthorizationText: true,
    withdrawalText: true,
    dataResponsibilityText: true,
    unclaimedEquipmentText: true,
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateTerm = (key: keyof typeof terms, value: string) => setTerms((current) => ({ ...current, [key]: value }));

  async function chooseLogo() {
    try {
      const image = await pickAndStoreImage('logos');
      if (image) update('logoUri', image.localUri);
    } catch (error) {
      Alert.alert('Logo nao selecionada', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  async function finish() {
    if (!form.name.trim() || (!form.phone.trim() && !form.whatsapp.trim())) {
      Alert.alert('Dados obrigatorios', 'Informe o nome da empresa e um telefone ou WhatsApp.');
      return;
    }
    try {
      await saveTerms({
        warrantyText: enabledTerms.warrantyText ? terms.warrantyText : '',
        serviceAuthorizationText: enabledTerms.serviceAuthorizationText ? terms.serviceAuthorizationText : '',
        withdrawalText: enabledTerms.withdrawalText ? terms.withdrawalText : '',
        dataResponsibilityText: enabledTerms.dataResponsibilityText ? terms.dataResponsibilityText : '',
        unclaimedEquipmentText: enabledTerms.unclaimedEquipmentText ? terms.unclaimedEquipmentText : '',
      });
      await saveCompany(form);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Nao foi possivel finalizar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return (
    <ScreenContainer
      footer={
        <View style={styles.footer}>
          {step > 0 ? <AppButton title="Voltar" variant="secondary" onPress={() => setStep((value) => value - 1)} /> : null}
          <AppButton title={step === 4 ? 'Ir para a Home' : 'Proximo'} onPress={() => (step === 4 ? finish() : setStep((value) => value + 1))} />
        </View>
      }
    >
      <StepDots current={step} total={5} />
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
          <InputField label="CPF/CNPJ" value={form.document} onChangeText={(value) => update('document', formatCpfCnpjInput(value))} keyboardType="numeric" />
          <InputField label="Responsavel" value={form.responsibleName} onChangeText={(value) => update('responsibleName', value)} />
          <InputField label="Telefone" value={form.phone} onChangeText={(value) => update('phone', formatPhoneInput(value))} keyboardType="phone-pad" />
          <InputField label="WhatsApp" value={form.whatsapp} onChangeText={(value) => update('whatsapp', formatPhoneInput(value))} keyboardType="phone-pad" />
          <InputField label="E-mail" value={form.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <AppHeader title="Endereco e logo" subtitle="Campos opcionais para enriquecer o PDF" />
          <AppCard>
            <AppText variant="subtitle">Logo da empresa</AppText>
            {form.logoUri ? <Image source={{ uri: form.logoUri }} style={[styles.logoPreview, { backgroundColor: colors.surfaceAlt }]} resizeMode="contain" /> : <AppText muted>Nenhuma logo selecionada.</AppText>}
            <View style={styles.footer}>
              <AppButton title={form.logoUri ? 'Trocar logo' : 'Adicionar logo'} variant="secondary" onPress={chooseLogo} />
              {form.logoUri ? <AppButton title="Remover" variant="danger" onPress={() => update('logoUri', '')} /> : null}
            </View>
          </AppCard>
          <InputField label="Endereco" value={form.addressLine} onChangeText={(value) => update('addressLine', value)} />
          <InputField label="Cidade" value={form.city} onChangeText={(value) => update('city', value)} />
          <InputField label="Estado" value={form.state} onChangeText={(value) => update('state', value)} />
          <InputField label="CEP" value={form.zipCode} onChangeText={(value) => update('zipCode', value)} />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <AppHeader title="Termos padrao" subtitle="Textos exibidos no PDF da OS" />
          <TermToggle
            label="Garantia padrao"
            enabled={enabledTerms.warrantyText}
            onToggle={() => setEnabledTerms((current) => ({ ...current, warrantyText: !current.warrantyText }))}
          />
          {enabledTerms.warrantyText ? <InputField label="Texto da garantia" value={terms.warrantyText} onChangeText={(value) => updateTerm('warrantyText', value)} multiline style={styles.textArea} /> : null}
          <TermToggle
            label="Autorizacao de servico"
            enabled={enabledTerms.serviceAuthorizationText}
            onToggle={() => setEnabledTerms((current) => ({ ...current, serviceAuthorizationText: !current.serviceAuthorizationText }))}
          />
          {enabledTerms.serviceAuthorizationText ? <InputField label="Texto de autorizacao" value={terms.serviceAuthorizationText} onChangeText={(value) => updateTerm('serviceAuthorizationText', value)} multiline style={styles.textArea} /> : null}
          <TermToggle
            label="Termo de retirada"
            enabled={enabledTerms.withdrawalText}
            onToggle={() => setEnabledTerms((current) => ({ ...current, withdrawalText: !current.withdrawalText }))}
          />
          <TermToggle
            label="Responsabilidade sobre dados"
            enabled={enabledTerms.dataResponsibilityText}
            onToggle={() => setEnabledTerms((current) => ({ ...current, dataResponsibilityText: !current.dataResponsibilityText }))}
          />
        </>
      ) : null}

      {step === 4 ? (
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

function StepDots({ current, total }: { current: number; total: number }) {
  const colors = useThemeColors();
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, index) => (
        <View key={index} style={[styles.dot, { backgroundColor: index === current ? colors.primary : colors.border }]} />
      ))}
    </View>
  );
}

function TermToggle({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onToggle}>
      <AppCard>
        <View style={styles.termRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="subtitle">{label}</AppText>
            <AppText muted>{enabled ? 'Sera exibido nos PDFs futuros' : 'Oculto nos PDFs futuros'}</AppText>
          </View>
          <Switch value={enabled} onValueChange={onToggle} trackColor={{ true: colors.primarySoft, false: colors.border }} thumbColor={enabled ? colors.primary : colors.disabled} ios_backgroundColor={colors.border} />
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  welcome: { gap: spacing.md, paddingTop: spacing['3xl'] },
  center: { textAlign: 'center' },
  footer: { flexDirection: 'row', gap: spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginBottom: spacing.md },
  dot: { width: 7, height: 7, borderRadius: 4 },
  termRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  textArea: { minHeight: 82, textAlignVertical: 'top' },
  logoPreview: { width: '100%', height: 96, marginTop: spacing.sm, marginBottom: spacing.sm, borderRadius: 8 },
});
