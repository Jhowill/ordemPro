import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';
import { useAppData } from '@/services/storage';
import { formatCpfCnpjInput, formatPhoneInput } from '@/utils/formatters';

export default function NewCustomerScreen() {
  const { addCustomer } = useAppData();
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', email: '', document: '', city: '', state: '' });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function save() {
    if (!form.name.trim() || (!form.phone.trim() && !form.whatsapp.trim())) {
      Alert.alert(t('onboarding.required'), t('onboarding.requiredDesc'));
      return;
    }
    try {
      const customer = await addCustomer({ kind: 'person', ...form });
      router.replace(`/customers/${customer.id}`);
    } catch (error) {
      Alert.alert(t('onboarding.newCustomerTitle'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  return (
    <ScreenContainer footer={<AppButton title={t('common.save')} onPress={save} />}>
      <AppHeader title={t('onboarding.newCustomerTitle')} subtitle={t('onboarding.newCustomerDesc')} back />
      <InputField label={t('company.fields.name')} value={form.name} onChangeText={(value) => update('name', value)} />
      <InputField label={t('company.fields.phone')} value={form.phone} onChangeText={(value) => update('phone', formatPhoneInput(value))} keyboardType="phone-pad" />
      <InputField label={t('company.fields.whatsapp')} value={form.whatsapp} onChangeText={(value) => update('whatsapp', formatPhoneInput(value))} keyboardType="phone-pad" />
      <InputField label={t('company.fields.document')} value={form.document} onChangeText={(value) => update('document', formatCpfCnpjInput(value))} keyboardType="numeric" />
      <InputField label={t('company.fields.email')} value={form.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" />
      <InputField label={t('company.fields.city')} value={form.city} onChangeText={(value) => update('city', value)} />
      <InputField label={t('company.fields.state')} value={form.state} onChangeText={(value) => update('state', value)} />
    </ScreenContainer>
  );
}
