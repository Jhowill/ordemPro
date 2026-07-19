import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { formatCpfCnpjInput, formatPhoneInput } from '@/utils/formatters';

export default function CompanyOnboardingScreen() {
  const { data, saveCompany, saveTerms } = useAppData();
  const { t } = useI18n();
  const colors = useThemeColors();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: data.company?.name ?? 'Tech Solutions Assistencia',
    tradeName: data.company?.tradeName ?? 'Tech Solutions',
    document: formatCpfCnpjInput(data.company?.document ?? ''),
    responsibleName: data.company?.responsibleName ?? '',
    phone: formatPhoneInput(data.company?.phone ?? ''),
    whatsapp: formatPhoneInput(data.company?.whatsapp ?? ''),
    email: data.company?.email ?? '',
    addressLine: data.company?.addressLine ?? '',
    city: data.company?.city ?? '',
    state: data.company?.state ?? '',
    zipCode: data.company?.zipCode ?? '',
    logoUri: data.company?.logoUri ?? '',
  });
  const [terms, setTerms] = useState({
    warrantyText: data.terms.warrantyText,
    serviceAuthorizationText: data.terms.serviceAuthorizationText,
    withdrawalText: data.terms.withdrawalText,
    dataResponsibilityText: data.terms.dataResponsibilityText,
    unclaimedEquipmentText: data.terms.unclaimedEquipmentText,
  });
  const [enabledTerms, setEnabledTerms] = useState({
    warrantyText: true,
    serviceAuthorizationText: true,
    withdrawalText: true,
    dataResponsibilityText: true,
    unclaimedEquipmentText: true,
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateTerm = (key: keyof typeof terms, value: string) => setTerms((current) => ({ ...current, [key]: value }));

  async function chooseLogo() {
    try {
      const image = await pickAndStoreImage('logos');
      if (image) update('logoUri', image.localUri);
    } catch (error) {
      Alert.alert(t('onboarding.logo.title'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  async function finish() {
    if (!form.name.trim() || (!form.phone.trim() && !form.whatsapp.trim())) {
      Alert.alert(t('onboarding.required'), t('onboarding.requiredDesc'));
      return;
    }
    try {
      await saveTerms({
        warrantyText: enabledTerms.warrantyText ? terms.warrantyText : '',
        serviceAuthorizationText: enabledTerms.serviceAuthorizationText ? terms.serviceAuthorizationText : '',
        withdrawalText: enabledTerms.withdrawalText ? terms.withdrawalText : '',
        dataResponsibilityText: enabledTerms.dataResponsibilityText ? terms.dataResponsibilityText : '',
        unclaimedEquipmentText: enabledTerms.unclaimedEquipmentText ? terms.unclaimedEquipmentText : '',
      });
      await saveCompany(form);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(t('common.saveChanges'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  return (
    <ScreenContainer
      footer={
        <View style={styles.footer}>
          {step > 0 ? <AppButton title={t('common.back')} variant="secondary" onPress={() => setStep((value) => value - 1)} /> : null}
          <AppButton title={step === 4 ? t('onboarding.finish') : t('onboarding.next')} onPress={() => (step === 4 ? finish() : setStep((value) => value + 1))} />
        </View>
      }
    >
      <StepDots current={step} total={5} />
      {step === 0 ? (
        <View style={styles.welcome}>
          <AppText variant="h1" style={styles.center}>{t('onboarding.title')}</AppText>
          <AppText muted style={styles.center}>{t('onboarding.subtitle')}</AppText>
          {[t('onboarding.card1'), t('onboarding.card2'), t('onboarding.card3')].map((item) => <AppCard key={item}><AppText>{item}</AppText></AppCard>)}
        </View>
      ) : null}

      {step === 1 ? (
        <>
          <AppHeader title={t('onboarding.steps.company')} subtitle={t('onboarding.subtitle')} />
          <InputField label={t('company.fields.name')} value={form.name} onChangeText={(value) => update('name', value)} />
          <InputField label={t('company.fields.tradeName')} value={form.tradeName} onChangeText={(value) => update('tradeName', value)} />
          <InputField label={t('company.fields.document')} value={form.document} onChangeText={(value) => update('document', formatCpfCnpjInput(value))} keyboardType="numeric" />
          <InputField label={t('company.fields.responsibleName')} value={form.responsibleName} onChangeText={(value) => update('responsibleName', value)} />
          <InputField label={t('company.fields.phone')} value={form.phone} onChangeText={(value) => update('phone', formatPhoneInput(value))} keyboardType="phone-pad" />
          <InputField label={t('company.fields.whatsapp')} value={form.whatsapp} onChangeText={(value) => update('whatsapp', formatPhoneInput(value))} keyboardType="phone-pad" />
          <InputField label={t('company.fields.email')} value={form.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <AppHeader title={t('onboarding.steps.address')} subtitle={t('onboarding.addressOptional')} />
          <AppCard>
            <AppText variant="subtitle">{t('onboarding.logo.title')}</AppText>
            {form.logoUri ? <Image source={{ uri: form.logoUri }} style={[styles.logoPreview, { backgroundColor: colors.surfaceAlt }]} resizeMode="contain" /> : <AppText muted>{t('onboarding.logo.noLogo')}</AppText>}
            <View style={styles.footer}>
              <AppButton title={form.logoUri ? t('onboarding.logo.replace') : t('onboarding.logo.add')} variant="secondary" onPress={chooseLogo} />
              {form.logoUri ? <AppButton title={t('onboarding.logo.remove')} variant="danger" onPress={() => update('logoUri', '')} /> : null}
            </View>
          </AppCard>
          <InputField label={t('company.fields.addressLine')} value={form.addressLine} onChangeText={(value) => update('addressLine', value)} />
          <InputField label={t('company.fields.city')} value={form.city} onChangeText={(value) => update('city', value)} />
          <InputField label={t('company.fields.state')} value={form.state} onChangeText={(value) => update('state', value)} />
          <InputField label={t('common.zipCode')} value={form.zipCode} onChangeText={(value) => update('zipCode', value)} />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <AppHeader title={t('onboarding.steps.terms')} subtitle={t('pdf.termsTitle')} />
          <TermToggle label={t('onboarding.terms.warranty')} enabled={enabledTerms.warrantyText} onToggle={() => setEnabledTerms((current) => ({ ...current, warrantyText: !current.warrantyText }))} />
          {enabledTerms.warrantyText ? <InputField label={t('pdf.warranty')} value={terms.warrantyText} onChangeText={(value) => updateTerm('warrantyText', value)} multiline style={styles.textArea} /> : null}
          <TermToggle label={t('onboarding.terms.serviceAuthorization')} enabled={enabledTerms.serviceAuthorizationText} onToggle={() => setEnabledTerms((current) => ({ ...current, serviceAuthorizationText: !current.serviceAuthorizationText }))} />
          {enabledTerms.serviceAuthorizationText ? <InputField label={t('pdf.authorization')} value={terms.serviceAuthorizationText} onChangeText={(value) => updateTerm('serviceAuthorizationText', value)} multiline style={styles.textArea} /> : null}
          <TermToggle label={t('onboarding.terms.withdrawal')} enabled={enabledTerms.withdrawalText} onToggle={() => setEnabledTerms((current) => ({ ...current, withdrawalText: !current.withdrawalText }))} />
          {enabledTerms.withdrawalText ? <InputField label={t('pdf.withdrawal')} value={terms.withdrawalText} onChangeText={(value) => updateTerm('withdrawalText', value)} multiline style={styles.textArea} /> : null}
          <TermToggle label={t('onboarding.terms.dataResponsibility')} enabled={enabledTerms.dataResponsibilityText} onToggle={() => setEnabledTerms((current) => ({ ...current, dataResponsibilityText: !current.dataResponsibilityText }))} />
          {enabledTerms.dataResponsibilityText ? <InputField label={t('pdf.dataResponsibility')} value={terms.dataResponsibilityText} onChangeText={(value) => updateTerm('dataResponsibilityText', value)} multiline style={styles.textArea} /> : null}
          <TermToggle label={t('pdf.unclaimedEquipment')} enabled={enabledTerms.unclaimedEquipmentText} onToggle={() => setEnabledTerms((current) => ({ ...current, unclaimedEquipmentText: !current.unclaimedEquipmentText }))} />
          {enabledTerms.unclaimedEquipmentText ? <InputField label={t('pdf.unclaimedEquipment')} value={terms.unclaimedEquipmentText} onChangeText={(value) => updateTerm('unclaimedEquipmentText', value)} multiline style={styles.textArea} /> : null}
        </>
      ) : null}

      {step === 4 ? (
        <>
          <AppHeader title={t('onboarding.steps.done')} subtitle={t('onboarding.summaryTerms')} />
          <AppCard>
            <SectionTitle title={t('onboarding.summary')} />
            <AppText variant="subtitle">{form.name}</AppText>
            <AppText muted>{form.phone || form.whatsapp}</AppText>
            <AppText muted>{form.city ? `${form.city}/${form.state}` : t('onboarding.addressOptional')}</AppText>
          </AppCard>
          <AppCard>
            <AppText variant="subtitle">{t('onboarding.summaryTerms')}</AppText>
            <AppText muted>{t('onboarding.summaryTermsDesc')}</AppText>
          </AppCard>
        </>
      ) : null}
    </ScreenContainer>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  const colors = useThemeColors();
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, index) => (
        <View key={index} style={[styles.dot, { backgroundColor: index === current ? colors.primary : colors.border }]} />
      ))}
    </View>
  );
}

function TermToggle({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  const colors = useThemeColors();
  const { t } = useI18n();
  return (
    <Pressable onPress={onToggle}>
      <AppCard>
        <View style={styles.termRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="subtitle">{label}</AppText>
            <AppText muted>{enabled ? t('onboarding.terms.visible') : t('onboarding.terms.hidden')}</AppText>
          </View>
          <Switch value={enabled} onValueChange={onToggle} trackColor={{ true: colors.primarySoft, false: colors.border }} thumbColor={enabled ? colors.primary : colors.disabled} ios_backgroundColor={colors.border} />
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  welcome: { gap: spacing.md, paddingTop: spacing['3xl'] },
  center: { textAlign: 'center' },
  footer: { flexDirection: 'row', gap: spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginBottom: spacing.md },
  dot: { width: 7, height: 7, borderRadius: 4 },
  termRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  textArea: { minHeight: 82, textAlignVertical: 'top' },
  logoPreview: { width: '100%', height: 96, marginTop: spacing.sm, marginBottom: spacing.sm, borderRadius: 8 },
});
