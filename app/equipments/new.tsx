import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAppData } from '@/services/storage';

export default function NewEquipmentScreen() {
  const { data, addEquipment } = useAppData();
  const firstCustomer = data.customers[0]?.id ?? '';
  const [form, setForm] = useState({ customerId: firstCustomer, type: 'Notebook', brand: '', model: '', serialNumber: '', description: '' });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function save() {
    if (!form.customerId || (!form.type.trim() && !form.description.trim())) {
      Alert.alert('Campos obrigatorios', 'Selecione cliente e informe tipo ou descricao.');
      return;
    }
    try {
      const equipment = await addEquipment({ ...form, category: 'notebook' });
      router.replace(`/equipments/${equipment.id}`);
    } catch (error) {
      Alert.alert('Equipamento nao salvo', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return (
    <ScreenContainer footer={<AppButton title="Salvar equipamento" onPress={save} />}>
      <AppHeader title="Novo equipamento" subtitle="Vinculado a um cliente" back />
      <InputField label="ID do cliente" value={form.customerId} onChangeText={(value) => update('customerId', value)} />
      <InputField label="Tipo" value={form.type} onChangeText={(value) => update('type', value)} />
      <InputField label="Marca" value={form.brand} onChangeText={(value) => update('brand', value)} />
      <InputField label="Modelo" value={form.model} onChangeText={(value) => update('model', value)} />
      <InputField label="Numero de serie" value={form.serialNumber} onChangeText={(value) => update('serialNumber', value)} />
      <InputField label="Descricao" value={form.description} onChangeText={(value) => update('description', value)} />
    </ScreenContainer>
  );
}
