import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAppData } from '@/services/storage';

export default function CompanySettingsScreen() {
  const { data, saveCompany } = useAppData();
  const [form, setForm] = useState({
    name: data.company?.name ?? '',
    tradeName: data.company?.tradeName ?? '',
    document: data.company?.document ?? '',
    responsibleName: data.company?.responsibleName ?? '',
    phone: data.company?.phone ?? '',
    whatsapp: data.company?.whatsapp ?? '',
    email: data.company?.email ?? '',
    addressLine: data.company?.addressLine ?? '',
    city: data.company?.city ?? '',
    state: data.company?.state ?? '',
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function save() {
    await saveCompany(form);
    Alert.alert('Empresa salva');
    router.back();
  }

  return (
    <ScreenContainer footer={<AppButton title="Salvar alteracoes" onPress={save} />}>
      <AppHeader title="Dados da empresa" subtitle="Usado no PDF" back />
      <InputField label="Nome" value={form.name} onChangeText={(value) => update('name', value)} />
      <InputField label="Nome fantasia" value={form.tradeName} onChangeText={(value) => update('tradeName', value)} />
      <InputField label="CPF/CNPJ" value={form.document} onChangeText={(value) => update('document', value)} />
      <InputField label="Responsavel" value={form.responsibleName} onChangeText={(value) => update('responsibleName', value)} />
      <InputField label="Telefone" value={form.phone} onChangeText={(value) => update('phone', value)} />
      <InputField label="WhatsApp" value={form.whatsapp} onChangeText={(value) => update('whatsapp', value)} />
      <InputField label="E-mail" value={form.email} onChangeText={(value) => update('email', value)} />
      <InputField label="Endereco" value={form.addressLine} onChangeText={(value) => update('addressLine', value)} />
      <InputField label="Cidade" value={form.city} onChangeText={(value) => update('city', value)} />
      <InputField label="Estado" value={form.state} onChangeText={(value) => update('state', value)} />
    </ScreenContainer>
  );
}

