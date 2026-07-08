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
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';
import { CatalogPart } from '@/types';
import { formatMoney, formatMoneyInput, moneyFromText } from '@/utils/formatters';

export default function PartsCatalogScreen() {
  const colors = useThemeColors();
  const { t } = useI18n();
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
      Alert.alert(t('catalog.partName'));
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
    } catch (error) {
      Alert.alert(t('catalog.savingPart'), error instanceof Error ? error.message : t('common.retry'));
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(part: CatalogPart) {
    Alert.alert(t('catalog.deletePart'), t('catalog.deletePartConfirm', { name: part.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCatalogPart(part.id);
          } catch (error) {
            Alert.alert(t('catalog.deletePartFail'), error instanceof Error ? error.message : t('common.retry'));
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer footer={showForm ? <AppButton title={editing ? t('common.saveChanges') : t('catalog.savePart')} loading={saving} onPress={save} /> : <AppButton title={t('catalog.newPart')} onPress={openNew} />}>
      <AppHeader title={t('catalog.partsTitle')} subtitle={t('catalog.partsSubtitle')} back />
      {showForm ? (
        <AppCard>
          <SectionTitle title={editing ? t('catalog.editPart') : t('catalog.newPart')} />
          <InputField label={t('catalog.partName')} value={name} onChangeText={setName} />
          <InputField label={t('catalog.category')} value={category} onChangeText={setCategory} />
          <InputField label={t('catalog.saleValue')} value={price} onChangeText={(value) => setPrice(formatMoneyInput(value))} keyboardType="numeric" placeholder="R$ 0,00" />
          <AppButton title={t('common.cancel')} variant="secondary" compact onPress={closeForm} />
        </AppCard>
      ) : null}

      <SectionTitle title={t('catalog.partsListTitle')} description={t('catalog.itemCount', { count: data.parts.length })} />
      <PaginatedList
        items={data.parts}
        keyExtractor={(part) => part.id}
        empty={<AppText muted>{t('catalog.partsEmpty')}</AppText>}
        renderItem={(part) => (
          <AppCard key={part.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <AppText variant="subtitle">{part.name}</AppText>
                <AppText muted>{part.category ?? t('catalog.category')} - {formatMoney(part.salePriceCents)}</AppText>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openEdit(part)} style={[styles.iconButton, { backgroundColor: colors.primarySoft }]}><Ionicons name="create-outline" size={20} color={colors.primary} /></Pressable>
                <Pressable onPress={() => confirmRemove(part)} style={[styles.iconButton, { backgroundColor: colors.dangerSoft }]}><Ionicons name="trash-outline" size={20} color={colors.danger} /></Pressable>
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
