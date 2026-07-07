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
import { CatalogService } from '@/types';
import { formatMoney, formatMoneyInput, moneyFromText } from '@/utils/formatters';

export default function ServicesCatalogScreen() {
  const colors = useThemeColors();
  const { data, saveCatalogService, removeCatalogService } = useAppData();
  const [editing, setEditing] = useState<CatalogService | null>(null);
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

  function openEdit(service: CatalogService) {
    setEditing(service);
    setName(service.name);
    setCategory(service.category ?? 'Geral');
    setPrice(formatMoney(service.defaultPriceCents));
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
      Alert.alert('Informe o nome do servico.');
      return;
    }
    try {
      setSaving(true);
      await saveCatalogService({
        ...editing,
        name,
        category,
        defaultPriceCents: moneyFromText(price),
      });
      closeForm();
    } catch (error) {
      Alert.alert('Servico nao salvo', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(service: CatalogService) {
    Alert.alert('Excluir servico', `Deseja excluir "${service.name}" do catalogo?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCatalogService(service.id);
          } catch (error) {
            Alert.alert('Servico nao excluido', error instanceof Error ? error.message : 'Tente novamente.');
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer footer={showForm ? <AppButton title={editing ? 'Salvar alteracoes' : 'Adicionar servico'} loading={saving} onPress={save} /> : <AppButton title="Novo servico" onPress={openNew} />}>
      <AppHeader title="Catalogo de servicos" subtitle="Servicos frequentes para agilizar a OS" back />
      {showForm ? (
        <AppCard>
          <SectionTitle title={editing ? 'Editar servico' : 'Novo servico'} />
          <InputField label="Nome do servico" value={name} onChangeText={setName} />
          <InputField label="Categoria" value={category} onChangeText={setCategory} />
          <InputField label="Valor padrao" value={price} onChangeText={(value) => setPrice(formatMoneyInput(value))} keyboardType="numeric" placeholder="R$ 0,00" />
          <AppButton title="Cancelar" variant="secondary" compact onPress={closeForm} />
        </AppCard>
      ) : null}

      <SectionTitle title="Servicos cadastrados" description={`${data.services.length} item${data.services.length === 1 ? '' : 's'}`} />
      <PaginatedList
        items={data.services}
        keyExtractor={(service) => service.id}
        empty={<AppText muted>Nenhum servico cadastrado.</AppText>}
        renderItem={(service) => (
          <AppCard key={service.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <AppText variant="subtitle">{service.name}</AppText>
                <AppText muted>{service.category ?? 'Geral'} - {formatMoney(service.defaultPriceCents)}</AppText>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openEdit(service)} style={[styles.iconButton, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => confirmRemove(service)} style={[styles.iconButton, { backgroundColor: colors.dangerSoft }]}>
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
