import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { AppHeader } from '@/components/ui/AppHeader';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { formatCpfCnpjInput, formatPhoneInput } from '@/utils/formatters';

export default function CompanySettingsScreen() {
  const { data, saveCompany } = useAppData();
  const colors = useThemeColors();
  const [form, setForm] = useState({
    name: data.company?.name ?? '',
    tradeName: data.company?.tradeName ?? '',
    document: formatCpfCnpjInput(data.company?.document ?? ''),
    responsibleName: data.company?.responsibleName ?? '',
    phone: formatPhoneInput(data.company?.phone ?? ''),
    whatsapp: formatPhoneInput(data.company?.whatsapp ?? ''),
    email: data.company?.email ?? '',
    addressLine: data.company?.addressLine ?? '',
    city: data.company?.city ?? '',
    state: data.company?.state ?? '',
    logoUri: data.company?.logoUri ?? '',
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function chooseLogo() {
    try {
      const image = await pickAndStoreImage('logos');
      if (image) update('logoUri', image.localUri);
    } catch (error) {
      Alert.alert('Logo nao selecionada', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  async function save() {
    try {
      await saveCompany(form);
      Alert.alert('Empresa salva');
      router.back();
    } catch (error) {
      Alert.alert('Nao foi possivel salvar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return (
    <ScreenContainer footer={<AppButton title="Salvar alteracoes" onPress={save} />}>
      <AppHeader title="Dados da empresa" subtitle="Usado no PDF" back />
      <AppCard>
        <AppText variant="subtitle">Logo da empresa</AppText>
        {form.logoUri ? <Image source={{ uri: form.logoUri }} style={[styles.logoPreview, { backgroundColor: colors.surfaceAlt }]} resizeMode="contain" /> : <AppText muted>Nenhuma logo selecionada.</AppText>}
        <View style={styles.row}>
          <AppButton title={form.logoUri ? 'Trocar logo' : 'Adicionar logo'} variant="secondary" onPress={chooseLogo} />
          {form.logoUri ? <AppButton title="Remover" variant="danger" onPress={() => update('logoUri', '')} /> : null}
        </View>
      </AppCard>
      <InputField label="Nome" value={form.name} onChangeText={(value) => update('name', value)} />
      <InputField label="Nome fantasia" value={form.tradeName} onChangeText={(value) => update('tradeName', value)} />
      <InputField label="CPF/CNPJ" value={form.document} onChangeText={(value) => update('document', formatCpfCnpjInput(value))} keyboardType="numeric" />
      <InputField label="Responsavel" value={form.responsibleName} onChangeText={(value) => update('responsibleName', value)} />
      <InputField label="Telefone" value={form.phone} onChangeText={(value) => update('phone', formatPhoneInput(value))} keyboardType="phone-pad" />
      <InputField label="WhatsApp" value={form.whatsapp} onChangeText={(value) => update('whatsapp', formatPhoneInput(value))} keyboardType="phone-pad" />
      <InputField label="E-mail" value={form.email} onChangeText={(value) => update('email', value)} />
      <InputField label="Endereco" value={form.addressLine} onChangeText={(value) => update('addressLine', value)} />
      <InputField label="Cidade" value={form.city} onChangeText={(value) => update('city', value)} />
      <InputField label="Estado" value={form.state} onChangeText={(value) => update('state', value)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoPreview: { width: '100%', height: 104, marginVertical: spacing.sm, borderRadius: 8 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
