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
import { CatalogService } from '@/types';
import { formatMoney, formatMoneyInput, moneyFromText } from '@/utils/formatters';

export default function ServicesCatalogScreen() {
  const colors = useThemeColors();
  const { t } = useI18n();
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
      Alert.alert(t('catalog.serviceName'));
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
      Alert.alert(t('catalog.savingService'), error instanceof Error ? error.message : t('common.retry'));
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(service: CatalogService) {
    Alert.alert(t('catalog.deleteService'), t('catalog.deleteServiceConfirm', { name: service.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCatalogService(service.id);
          } catch (error) {
            Alert.alert(t('catalog.deleteServiceFail'), error instanceof Error ? error.message : t('common.retry'));
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer footer={showForm ? <AppButton title={editing ? t('common.saveChanges') : t('catalog.saveService')} loading={saving} onPress={save} /> : <AppButton title={t('catalog.newService')} onPress={openNew} />}>
      <AppHeader title={t('catalog.servicesTitle')} subtitle={t('catalog.servicesSubtitle')} back />
      {showForm ? (
        <AppCard>
          <SectionTitle title={editing ? t('catalog.editService') : t('catalog.newService')} />
          <InputField label={t('catalog.serviceName')} value={name} onChangeText={setName} />
          <InputField label={t('catalog.category')} value={category} onChangeText={setCategory} />
          <InputField label={t('catalog.defaultValue')} value={price} onChangeText={(value) => setPrice(formatMoneyInput(value))} keyboardType="numeric" placeholder="R$ 0,00" />
          <AppButton title={t('common.cancel')} variant="secondary" compact onPress={closeForm} />
        </AppCard>
      ) : null}

      <SectionTitle title={t('catalog.servicesListTitle')} description={t('catalog.itemCount', { count: data.services.length })} />
      <PaginatedList
        items={data.services}
        keyExtractor={(service) => service.id}
        empty={<AppText muted>{t('catalog.servicesEmpty')}</AppText>}
        renderItem={(service) => (
          <AppCard key={service.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <AppText variant="subtitle">{service.name}</AppText>
                <AppText muted>{service.category ?? t('catalog.category')} - {formatMoney(service.defaultPriceCents)}</AppText>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openEdit(service)} style={[styles.iconButton, { backgroundColor: colors.primarySoft }]}><Ionicons name="create-outline" size={20} color={colors.primary} /></Pressable>
                <Pressable onPress={() => confirmRemove(service)} style={[styles.iconButton, { backgroundColor: colors.dangerSoft }]}><Ionicons name="trash-outline" size={20} color={colors.danger} /></Pressable>
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
