import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAppData } from '@/services/storage';

export default function NewCustomerScreen() {
  const { addCustomer } = useAppData();
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', email: '', document: '', city: '', state: '' });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function save() {
    if (!form.name.trim() || (!form.phone.trim() && !form.whatsapp.trim())) {
      Alert.alert('Campos obrigatorios', 'Informe nome e telefone ou WhatsApp.');
      return;
    }
    const customer = await addCustomer({ kind: 'person', ...form });
    router.replace(`/customers/${customer.id}`);
  }

  return (
    <ScreenContainer footer={<AppButton title="Salvar cliente" onPress={save} />}>
      <AppHeader title="Novo cliente" subtitle="Poucos campos obrigatorios" back />
      <InputField label="Nome" value={form.name} onChangeText={(value) => update('name', value)} />
      <InputField label="Telefone" value={form.phone} onChangeText={(value) => update('phone', value)} keyboardType="phone-pad" />
      <InputField label="WhatsApp" value={form.whatsapp} onChangeText={(value) => update('whatsapp', value)} keyboardType="phone-pad" />
      <InputField label="CPF/CNPJ" value={form.document} onChangeText={(value) => update('document', value)} />
      <InputField label="E-mail" value={form.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" />
      <InputField label="Cidade" value={form.city} onChangeText={(value) => update('city', value)} />
      <InputField label="Estado" value={form.state} onChangeText={(value) => update('state', value)} />
    </ScreenContainer>
  );
}

