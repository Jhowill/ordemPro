import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';
import { CatalogPart } from '@/types';
import { formatMoney, formatMoneyInput, moneyFromText } from '@/utils/formatters';

export default function PartsCatalogScreen() {
  const colors = useThemeColors();
  const { data, saveCatalogPart, removeCatalogPart } = useAppData();
  const [editing, setEditing] = useState<CatalogPart | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing(null);
    setName('');
    setCategory('Geral');
    setPrice('');
    setShowForm(true);
  }

  function openEdit(part: CatalogPart) {
    setEditing(part);
    setName(part.name);
    setCategory(part.category ?? 'Geral');
    setPrice(formatMoney(part.salePriceCents));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setName('');
    setCategory('Geral');
    setPrice('');
  }

  async function save() {
    if (!name.trim()) {
      Alert.alert('Informe o nome da peca.');
      return;
    }
    try {
      setSaving(true);
      await saveCatalogPart({
        ...editing,
        name,
        category,
        salePriceCents: moneyFromText(price),
      });
      closeForm();
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(part: CatalogPart) {
    Alert.alert('Excluir peca', `Deseja excluir "${part.name}" do catalogo?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removeCatalogPart(part.id) },
    ]);
  }

  return (
    <ScreenContainer footer={showForm ? <AppButton title={editing ? 'Salvar alteracoes' : 'Adicionar peca'} loading={saving} onPress={save} /> : <AppButton title="Nova peca" onPress={openNew} />}>
      <AppHeader title="Catalogo de pecas" subtitle="Sem controle de estoque na V1" back />
      {showForm ? (
        <AppCard>
          <SectionTitle title={editing ? 'Editar peca' : 'Nova peca'} />
          <InputField label="Nome da peca" value={name} onChangeText={setName} />
          <InputField label="Categoria" value={category} onChangeText={setCategory} />
          <InputField label="Preco de venda" value={price} onChangeText={(value) => setPrice(formatMoneyInput(value))} keyboardType="numeric" placeholder="R$ 0,00" />
          <AppButton title="Cancelar" variant="secondary" compact onPress={closeForm} />
        </AppCard>
      ) : null}

      <SectionTitle title="Pecas cadastradas" description={`${data.parts.length} item${data.parts.length === 1 ? '' : 's'}`} />
      <PaginatedList
        items={data.parts}
        keyExtractor={(part) => part.id}
        empty={<AppText muted>Nenhuma peca cadastrada.</AppText>}
        renderItem={(part) => (
          <AppCard key={part.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <AppText variant="subtitle">{part.name}</AppText>
                <AppText muted>{part.category ?? 'Geral'} - {formatMoney(part.salePriceCents)}</AppText>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openEdit(part)} style={[styles.iconButton, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => confirmRemove(part)} style={[styles.iconButton, { backgroundColor: colors.dangerSoft }]}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemInfo: { flex: 1, gap: spacing.xxs },
  actions: { flexDirection: 'row', gap: spacing.xs },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
