import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAppData } from '@/services/storage';
import { formatMoney, formatMoneyInput, moneyFromText } from '@/utils/formatters';

export default function ServicesCatalogScreen() {
  const { data, addCatalogService } = useAppData();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  async function save() {
    if (!name.trim()) {
      Alert.alert('Informe o nome do servico.');
      return;
    }
    await addCatalogService({ name, category: 'Geral', defaultPriceCents: moneyFromText(price) });
    setName('');
    setPrice('');
  }

  return (
    <ScreenContainer footer={<AppButton title="Adicionar servico" onPress={save} />}>
      <AppHeader title="Catalogo de servicos" subtitle="Servicos frequentes para agilizar a OS" back />
      <InputField label="Nome do servico" value={name} onChangeText={setName} />
      <InputField label="Valor padrao" value={price} onChangeText={(value) => setPrice(formatMoneyInput(value))} keyboardType="numeric" placeholder="R$ 0,00" />
      {data.services.map((service) => (
        <AppCard key={service.id}>
          <AppText variant="subtitle">{service.name}</AppText>
          <AppText muted>{service.category ?? 'Geral'} - {formatMoney(service.defaultPriceCents)}</AppText>
        </AppCard>
      ))}
    </ScreenContainer>
  );
}
