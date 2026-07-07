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
import { useAppData } from '@/services/storage';
import { formatDate } from '@/utils/formatters';

export default function BackupSettingsScreen() {
  const { data, exportBackup, importBackup, resetDemo } = useAppData();
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
      Alert.alert('Falha no backup', error instanceof Error ? error.message : 'Nao foi possivel gerar o arquivo de backup.');
    }
  }

  async function importJson() {
    try {
      await importBackup(json);
      Alert.alert('Backup importado');
    } catch (error) {
      Alert.alert('Backup invalido', error instanceof Error ? error.message : 'Verifique o conteudo.');
    }
  }

  async function pickBackupFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled || !result.assets[0]?.uri) return;
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      setJson(content);
      await importBackup(content);
      Alert.alert('Backup importado');
    } catch (error) {
      Alert.alert('Backup invalido', error instanceof Error ? error.message : 'Verifique o arquivo selecionado.');
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title="Backup" subtitle="Exportacao manual offline" back />
      <AppCard>
        <AppText variant="subtitle">Ultimo backup</AppText>
        <AppText muted>{data.backup.lastBackupAt ? formatDate(data.backup.lastBackupAt) : 'Nenhum backup realizado'}</AppText>
      </AppCard>
      <AppButton title="Fazer backup agora" onPress={exportJson} />
      <InputField label="Importar JSON de backup" value={json} onChangeText={setJson} multiline style={{ minHeight: 120 }} />
      <AppButton title="Selecionar arquivo JSON" variant="secondary" onPress={pickBackupFile} />
      <AppButton title="Restaurar backup" variant="secondary" onPress={importJson} />
      <AppButton title="Restaurar dados de demonstracao" variant="danger" onPress={resetDemo} />
    </ScreenContainer>
  );
}
