import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { formatCpfCnpjInput, formatPhoneInput } from '@/utils/formatters';

export default function CompanySettingsScreen() {
  const { data, saveCompany } = useAppData();
  const { t } = useI18n();
  const colors = useThemeColors();
  const [form, setForm] = useState({
    name: data.company?.name ?? '',
    tradeName: data.company?.tradeName ?? '',
    document: formatCpfCnpjInput(data.company?.document ?? ''),
    responsibleName: data.company?.responsibleName ?? '',
    phone: formatPhoneInput(data.company?.phone ?? ''),
    whatsapp: formatPhoneInput(data.company?.whatsapp ?? ''),
    email: data.company?.email ?? '',
    addressLine: data.company?.addressLine ?? '',
    city: data.company?.city ?? '',
    state: data.company?.state ?? '',
    logoUri: data.company?.logoUri ?? '',
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function chooseLogo() {
    try {
      const image = await pickAndStoreImage('logos');
      if (image) update('logoUri', image.localUri);
    } catch (error) {
      Alert.alert(t('company.logoTitle'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  async function save() {
    try {
      await saveCompany(form);
      Alert.alert(t('company.title'));
      router.back();
    } catch (error) {
      Alert.alert(t('common.saveChanges'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  return (
    <ScreenContainer footer={<AppButton title={t('company.save')} onPress={save} />}>
      <AppHeader title={t('company.title')} subtitle={t('company.subtitle')} back />
      <AppCard>
        <AppText variant="subtitle">{t('company.logoTitle')}</AppText>
        {form.logoUri ? <Image source={{ uri: form.logoUri }} style={[styles.logoPreview, { backgroundColor: colors.surfaceAlt }]} resizeMode="contain" /> : <AppText muted>{t('company.noLogo')}</AppText>}
        <View style={styles.row}>
          <AppButton title={form.logoUri ? t('company.replaceLogo') : t('company.addLogo')} variant="secondary" onPress={chooseLogo} />
          {form.logoUri ? <AppButton title={t('common.remove')} variant="danger" onPress={() => update('logoUri', '')} /> : null}
        </View>
      </AppCard>
      <InputField label={t('company.fields.name')} value={form.name} onChangeText={(value) => update('name', value)} />
      <InputField label={t('company.fields.tradeName')} value={form.tradeName} onChangeText={(value) => update('tradeName', value)} />
      <InputField label={t('company.fields.document')} value={form.document} onChangeText={(value) => update('document', formatCpfCnpjInput(value))} keyboardType="numeric" />
      <InputField label={t('company.fields.responsibleName')} value={form.responsibleName} onChangeText={(value) => update('responsibleName', value)} />
      <InputField label={t('company.fields.phone')} value={form.phone} onChangeText={(value) => update('phone', formatPhoneInput(value))} keyboardType="phone-pad" />
      <InputField label={t('company.fields.whatsapp')} value={form.whatsapp} onChangeText={(value) => update('whatsapp', formatPhoneInput(value))} keyboardType="phone-pad" />
      <InputField label={t('company.fields.email')} value={form.email} onChangeText={(value) => update('email', value)} />
      <InputField label={t('company.fields.addressLine')} value={form.addressLine} onChangeText={(value) => update('addressLine', value)} />
      <InputField label={t('company.fields.city')} value={form.city} onChangeText={(value) => update('city', value)} />
      <InputField label={t('company.fields.state')} value={form.state} onChangeText={(value) => update('state', value)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoPreview: { width: '100%', height: 104, marginVertical: spacing.sm, borderRadius: 8 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
