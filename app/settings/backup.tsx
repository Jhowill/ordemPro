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
    const backup = await exportBackup();
    setJson(backup);
    const uri = `${FileSystem.documentDirectory}ordempro-backup.json`;
    await FileSystem.writeAsStringAsync(uri, backup);
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
  }

  async function importJson() {
    try {
      await importBackup(json);
      Alert.alert('Backup importado');
    } catch (error) {
      Alert.alert('Backup invalido', error instanceof Error ? error.message : 'Verifique o conteudo.');
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
      <AppButton title="Restaurar backup" variant="secondary" onPress={importJson} />
      <AppButton title="Restaurar dados de demonstracao" variant="danger" onPress={resetDemo} />
    </ScreenContainer>
  );
}
