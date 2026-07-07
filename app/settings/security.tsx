import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/theme';
import { useAppData } from '@/services/storage';
import { isValidPin, normalizePinInput } from '@/utils/pinSecurity';
import { createSecurePinSettings, verifySecurityPin } from '@/utils/securePinStorage';

export default function SecuritySettingsScreen() {
  const { data, clearAllData, optimizeStorage, saveSecuritySettings, verifyDatabaseIntegrity } = useAppData();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [checkingDatabase, setCheckingDatabase] = useState(false);
  const [clearing, setClearing] = useState(false);

  const pinEnabled = data.security.isPinEnabled;

  function clearPinFields() {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  }

  function validateNewPin() {
    if (!isValidPin(newPin)) {
      Alert.alert('PIN invalido', 'Use um PIN numerico com 4 a 6 digitos.');
      return false;
    }
    if (newPin !== confirmPin) {
      Alert.alert('PIN diferente', 'A confirmacao precisa ser igual ao novo PIN.');
      return false;
    }
    return true;
  }

  async function validateCurrentPin() {
    let isValid = false;
    try {
      isValid = await verifySecurityPin(currentPin, data.security);
    } catch {
      Alert.alert('Falha ao validar PIN', 'Tente novamente.');
      return false;
    }
    if (!isValid) {
      Alert.alert('PIN incorreto', 'Informe o PIN atual para continuar.');
      return false;
    }
    return true;
  }

  async function enablePin() {
    if (!validateNewPin()) return;
    try {
      setSavingPin(true);
      await saveSecuritySettings(await createSecurePinSettings(newPin));
      clearPinFields();
      Alert.alert('PIN ativado', 'O app pedira o PIN ao abrir novamente.');
    } catch (error) {
      Alert.alert('Nao foi possivel salvar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSavingPin(false);
    }
  }

  async function changePin() {
    if (!(await validateCurrentPin()) || !validateNewPin()) return;
    try {
      setSavingPin(true);
      await saveSecuritySettings(await createSecurePinSettings(newPin));
      clearPinFields();
      Alert.alert('PIN alterado', 'O novo PIN ja esta ativo.');
    } catch (error) {
      Alert.alert('Nao foi possivel alterar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSavingPin(false);
    }
  }

  async function disablePin() {
    if (!(await validateCurrentPin())) return;
    try {
      setSavingPin(true);
      await saveSecuritySettings({ isPinEnabled: false });
      clearPinFields();
      Alert.alert('PIN desativado', 'O app nao pedira PIN ao abrir.');
    } catch (error) {
      Alert.alert('Nao foi possivel desativar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSavingPin(false);
    }
  }

  async function handleClearData() {
    try {
      setClearing(true);
      await clearAllData();
      Alert.alert('Dados limpos', 'O OrdemPro foi zerado neste aparelho.');
      router.replace('/onboarding/company');
    } catch (error) {
      Alert.alert('Nao foi possivel limpar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setClearing(false);
    }
  }

  async function handleOptimizeStorage() {
    try {
      setOptimizing(true);
      const result = await optimizeStorage();
      Alert.alert(
        'Armazenamento otimizado',
        `${result.removedFiles} arquivo(s) local(is) removido(s).\n${result.removedPdfRecords} registro(s) antigo(s) de PDF removido(s).\n${result.scannedFiles} arquivo(s) de midia verificado(s).`,
      );
    } catch (error) {
      Alert.alert('Nao foi possivel otimizar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setOptimizing(false);
    }
  }

  async function handleCheckDatabase() {
    try {
      setCheckingDatabase(true);
      const result = await verifyDatabaseIntegrity();
      Alert.alert(
        result.ok ? 'Banco local saudavel' : 'Atenção no banco local',
        result.ok ? 'O SQLite respondeu sem sinais de corrupcao.' : result.details.join('\n'),
      );
    } catch (error) {
      Alert.alert('Falha ao verificar banco', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setCheckingDatabase(false);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title="Seguranca" subtitle="PIN local e privacidade" back />
      <AppCard>
        <AppText variant="subtitle">Bloqueio por PIN</AppText>
        <AppText muted>
          {pinEnabled
            ? 'Ativo. O OrdemPro solicita o PIN quando o app e aberto.'
            : 'Desativado. Ative um PIN numerico para bloquear o acesso local ao app.'}
        </AppText>
      </AppCard>

      <AppCard>
        <AppText variant="subtitle">{pinEnabled ? 'Alterar PIN' : 'Ativar PIN'}</AppText>
        {pinEnabled ? (
          <InputField
            label="PIN atual"
            value={currentPin}
            onChangeText={(value) => setCurrentPin(normalizePinInput(value))}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
        ) : null}
        <InputField
          label={pinEnabled ? 'Novo PIN' : 'PIN'}
          value={newPin}
          onChangeText={(value) => setNewPin(normalizePinInput(value))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        <InputField
          label="Confirmar PIN"
          value={confirmPin}
          onChangeText={(value) => setConfirmPin(normalizePinInput(value))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        <View style={styles.actions}>
          <AppButton title={pinEnabled ? 'Salvar novo PIN' : 'Ativar PIN'} loading={savingPin} onPress={pinEnabled ? changePin : enablePin} />
          {pinEnabled ? <AppButton title="Desativar PIN" variant="danger" loading={savingPin} onPress={disablePin} /> : null}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="subtitle">Privacidade</AppText>
        <AppText muted>Os dados ficam no aparelho. Compartilhamento e backup acontecem somente por acao do usuario.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">Otimizar armazenamento</AppText>
        <AppText muted>Remove midias locais sem uso e mantem no maximo os 5 PDFs mais recentes de cada OS.</AppText>
        <AppButton title="Otimizar agora" variant="secondary" loading={optimizing} onPress={handleOptimizeStorage} />
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">Verificar banco local</AppText>
        <AppText muted>Confere a integridade do SQLite deste aparelho antes que uma falha vire problema de abertura.</AppText>
        <AppButton title="Verificar SQLite" variant="secondary" loading={checkingDatabase} onPress={handleCheckDatabase} />
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">Limpar dados do app</AppText>
        <AppText muted>Apaga empresa, clientes, equipamentos, OS, fotos, assinaturas, PDFs e backups locais deste aparelho.</AppText>
        <HoldToConfirmButton
          title="Segure por 3s para limpar tudo"
          holdTitle="Continue segurando para confirmar"
          loading={clearing}
          onConfirm={handleClearData}
        />
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
});
