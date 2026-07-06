import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAppData } from '@/services/storage';
import { formatMoney, moneyFromText } from '@/utils/formatters';

export default function PartsCatalogScreen() {
  const { data, addCatalogPart } = useAppData();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  async function save() {
    if (!name.trim()) {
      Alert.alert('Informe o nome da peca.');
      return;
    }
    await addCatalogPart({ name, category: 'Geral', salePriceCents: moneyFromText(price) });
    setName('');
    setPrice('');
  }

  return (
    <ScreenContainer footer={<AppButton title="Adicionar peca" onPress={save} />}>
      <AppHeader title="Catalogo de pecas" subtitle="Sem controle de estoque na V1" back />
      <InputField label="Nome da peca" value={name} onChangeText={setName} />
      <InputField label="Preco de venda" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="9500 = R$ 95,00" />
      {data.parts.map((part) => (
        <AppCard key={part.id}>
          <AppText variant="subtitle">{part.name}</AppText>
          <AppText muted>{part.category ?? 'Geral'} - {formatMoney(part.salePriceCents)}</AppText>
        </AppCard>
      ))}
    </ScreenContainer>
  );
}

