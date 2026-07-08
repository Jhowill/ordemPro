import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';
import { useAppData } from '@/services/storage';
import { formatDate } from '@/utils/formatters';

export default function BackupSettingsScreen() {
  const { data, exportBackup, importBackup, resetDemo } = useAppData();
  const { t } = useI18n();
  const [json, setJson] = useState('');

  async function exportJson() {
    try {
      const backup = await exportBackup();
      setJson(backup);
      if (!FileSystem.documentDirectory) throw new Error('Armazenamento local indisponivel neste dispositivo.');
      const uri = `${FileSystem.documentDirectory}ordempro-backup.json`;
      await FileSystem.writeAsStringAsync(uri, backup);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert(t('backup.alert.exportFail'), error instanceof Error ? error.message : t('backup.alert.exportFailDesc'));
    }
  }

  async function importJson() {
    try {
      await importBackup(json);
      Alert.alert(t('backup.alert.imported'));
    } catch (error) {
      Alert.alert(t('backup.alert.invalid'), error instanceof Error ? error.message : t('backup.alert.invalidDesc'));
    }
  }

  async function pickBackupFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled || !result.assets[0]?.uri) return;
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      setJson(content);
      await importBackup(content);
      Alert.alert(t('backup.alert.imported'));
    } catch (error) {
      Alert.alert(t('backup.alert.invalidFile'), error instanceof Error ? error.message : t('backup.alert.invalidFileDesc'));
    }
  }

  async function handleResetDemo() {
    try {
      await resetDemo();
      Alert.alert(t('backup.alert.restored'), t('backup.alert.restoredDesc'));
    } catch (error) {
      Alert.alert(t('backup.alert.restoreFail'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title={t('backup.title')} subtitle={t('backup.subtitle')} back />
      <AppCard>
        <AppText variant="subtitle">{t('backup.lastBackup')}</AppText>
        <AppText muted>{data.backup.lastBackupAt ? formatDate(data.backup.lastBackupAt, data.locale) : t('backup.none')}</AppText>
      </AppCard>
      <AppButton title={t('backup.now')} onPress={exportJson} />
      <InputField label={t('backup.importTitle')} value={json} onChangeText={setJson} multiline style={{ minHeight: 120 }} />
      <AppButton title={t('backup.selectFile')} variant="secondary" onPress={pickBackupFile} />
      <AppButton title={t('backup.restore')} variant="secondary" onPress={importJson} />
      <AppButton title={t('backup.restoreDemo')} variant="danger" onPress={handleResetDemo} />
    </ScreenContainer>
  );
}
