import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';
import { useAppData } from '@/services/storage';

export default function NewEquipmentScreen() {
  const { data, addEquipment } = useAppData();
  const { t } = useI18n();
  const firstCustomer = data.customers[0]?.id ?? '';
  const [form, setForm] = useState({ customerId: firstCustomer, type: 'Notebook', brand: '', model: '', serialNumber: '', description: '' });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function save() {
    if (!form.customerId || (!form.type.trim() && !form.description.trim())) {
      Alert.alert(t('orderNew.alerts.equipmentTypeMissing'));
      return;
    }
    try {
      const equipment = await addEquipment({ ...form, category: 'notebook' });
      router.replace(`/equipments/${equipment.id}`);
    } catch (error) {
      Alert.alert(t('onboarding.newEquipmentTitle'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  return (
    <ScreenContainer footer={<AppButton title={t('common.save')} onPress={save} />}>
      <AppHeader title={t('onboarding.newEquipmentTitle')} subtitle={t('onboarding.newEquipmentDesc')} back />
      <InputField label={t('details.customerTitle')} value={form.customerId} onChangeText={(value) => update('customerId', value)} />
      <InputField label={t('common.equipment')} value={form.type} onChangeText={(value) => update('type', value)} />
      <InputField label={t('common.brand')} value={form.brand} onChangeText={(value) => update('brand', value)} />
      <InputField label={t('details.model')} value={form.model} onChangeText={(value) => update('model', value)} />
      <InputField label={t('details.serial')} value={form.serialNumber} onChangeText={(value) => update('serialNumber', value)} />
      <InputField label={t('company.fields.addressLine')} value={form.description} onChangeText={(value) => update('description', value)} />
    </ScreenContainer>
  );
}
