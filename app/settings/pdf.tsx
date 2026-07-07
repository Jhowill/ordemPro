import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';

const colorOptions = ['#1E4FD7', '#0F766E', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED'];

export default function PdfSettingsScreen() {
  const { data, savePdfSettings, saveTerms } = useAppData();
  const colors = useThemeColors();
  const [settings, setSettings] = useState({
    primaryColor: data.pdfSettings.primaryColor,
    showPhotos: data.pdfSettings.showPhotos,
    showSignatures: data.pdfSettings.showSignatures,
    showValues: data.pdfSettings.showValues,
    showAppBranding: data.pdfSettings.showAppBranding,
    footerText: data.pdfSettings.footerText ?? '',
  });
  const [terms, setTerms] = useState({
    warrantyText: data.terms.warrantyText,
    serviceAuthorizationText: data.terms.serviceAuthorizationText,
    withdrawalText: data.terms.withdrawalText,
    dataResponsibilityText: data.terms.dataResponsibilityText,
    unclaimedEquipmentText: data.terms.unclaimedEquipmentText,
  });

  async function save() {
    try {
      await savePdfSettings({ ...settings, documentModel: data.pdfSettings.documentModel });
      await saveTerms(terms);
      Alert.alert('PDF atualizado', 'As alteracoes serao usadas nos novos PDFs ou em PDFs regenerados.');
    } catch (error) {
      Alert.alert('Nao foi possivel salvar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return (
    <ScreenContainer footer={<AppButton title="Salvar configuracoes" onPress={save} />}>
      <AppHeader title="PDF e termos" subtitle="Modelo classico da V1" back />
      <AppCard>
        <AppText variant="subtitle">Cor principal do PDF</AppText>
        <View style={styles.swatches}>
          {colorOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setSettings((current) => ({ ...current, primaryColor: option }))}
              style={[styles.swatch, { backgroundColor: option, borderColor: settings.primaryColor === option ? colors.text : colors.border }]}
            />
          ))}
        </View>
      </AppCard>
      <SettingSwitch label="Exibir fotos no PDF" value={settings.showPhotos} onValueChange={(showPhotos) => setSettings((current) => ({ ...current, showPhotos }))} />
      <SettingSwitch label="Exibir assinaturas no PDF" value={settings.showSignatures} onValueChange={(showSignatures) => setSettings((current) => ({ ...current, showSignatures }))} />
      <SettingSwitch label="Exibir valores no PDF" value={settings.showValues} onValueChange={(showValues) => setSettings((current) => ({ ...current, showValues }))} />
      <SettingSwitch label="Exibir marca OrdemPro" value={settings.showAppBranding} onValueChange={(showAppBranding) => setSettings((current) => ({ ...current, showAppBranding }))} />
      <InputField label="Rodape do PDF" value={settings.footerText} onChangeText={(footerText) => setSettings((current) => ({ ...current, footerText }))} />
      <AppCard>
        <AppText variant="subtitle">Termos padrao</AppText>
        <InputField label="Garantia" value={terms.warrantyText} onChangeText={(warrantyText) => setTerms((current) => ({ ...current, warrantyText }))} multiline style={styles.textArea} />
        <InputField label="Autorizacao" value={terms.serviceAuthorizationText} onChangeText={(serviceAuthorizationText) => setTerms((current) => ({ ...current, serviceAuthorizationText }))} multiline style={styles.textArea} />
        <InputField label="Retirada" value={terms.withdrawalText} onChangeText={(withdrawalText) => setTerms((current) => ({ ...current, withdrawalText }))} multiline style={styles.textArea} />
        <InputField label="Responsabilidade sobre dados" value={terms.dataResponsibilityText} onChangeText={(dataResponsibilityText) => setTerms((current) => ({ ...current, dataResponsibilityText }))} multiline style={styles.textArea} />
      </AppCard>
    </ScreenContainer>
  );
}

function SettingSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const colors = useThemeColors();
  return (
    <AppCard>
      <View style={styles.row}>
        <AppText variant="subtitle" style={{ flex: 1 }}>{label}</AppText>
        <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primarySoft, false: colors.border }} thumbColor={value ? colors.primary : colors.disabled} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  swatches: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  textArea: { minHeight: 78, textAlignVertical: 'top' },
});
