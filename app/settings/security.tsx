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
import { useI18n } from '@/hooks/useI18n';
import { useAppData } from '@/services/storage';
import { isValidPin, normalizePinInput } from '@/utils/pinSecurity';
import { createSecurePinSettings, verifySecurityPin } from '@/utils/securePinStorage';

export default function SecuritySettingsScreen() {
  const { data, clearAllData, optimizeStorage, saveSecuritySettings, verifyDatabaseIntegrity } = useAppData();
  const { t } = useI18n();
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
      Alert.alert(t('security.alerts.invalidPin'), t('security.alerts.pinRules'));
      return false;
    }
    if (newPin !== confirmPin) {
      Alert.alert(t('security.alerts.differentPin'), t('security.alerts.pinMismatch'));
      return false;
    }
    return true;
  }

  async function validateCurrentPin() {
    let isValid = false;
    try {
      isValid = await verifySecurityPin(currentPin, data.security);
    } catch {
      Alert.alert(t('security.alerts.currentPinFail'), t('security.alerts.retrySimple'));
      return false;
    }
    if (!isValid) {
      Alert.alert(t('security.alerts.wrongPin'), t('security.alerts.currentPinRequired'));
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
      Alert.alert(t('security.alerts.activated'), t('security.alerts.activatedDesc'));
    } catch (error) {
      Alert.alert(t('security.alerts.saveFail'), error instanceof Error ? error.message : t('security.alerts.retrySimple'));
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
      Alert.alert(t('security.alerts.changed'), t('security.alerts.changedDesc'));
    } catch (error) {
      Alert.alert(t('security.alerts.saveFail'), error instanceof Error ? error.message : t('security.alerts.retrySimple'));
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
      Alert.alert(t('security.alerts.disabled'), t('security.alerts.disabledDesc'));
    } catch (error) {
      Alert.alert(t('security.alerts.saveFail'), error instanceof Error ? error.message : t('security.alerts.retrySimple'));
    } finally {
      setSavingPin(false);
    }
  }

  async function handleClearData() {
    try {
      setClearing(true);
      await clearAllData();
      Alert.alert(t('security.alerts.cleared'), t('security.alerts.clearedDesc'));
    } catch (error) {
      Alert.alert(t('security.alerts.clearFail'), error instanceof Error ? error.message : t('security.alerts.retrySimple'));
    } finally {
      setClearing(false);
    }
  }

  async function handleOptimizeStorage() {
    try {
      setOptimizing(true);
      const result = await optimizeStorage();
      Alert.alert(
        t('security.optimizeTitle'),
        t('security.alerts.optimizeResult', {
          removedFiles: result.removedFiles,
          removedPdfRecords: result.removedPdfRecords,
          scannedFiles: result.scannedFiles,
        }),
      );
    } catch (error) {
      Alert.alert(t('security.alerts.optimizeFail'), error instanceof Error ? error.message : t('security.alerts.retrySimple'));
    } finally {
      setOptimizing(false);
    }
  }

  async function handleCheckDatabase() {
    try {
      setCheckingDatabase(true);
      const result = await verifyDatabaseIntegrity();
      Alert.alert(
        result.ok ? t('security.alerts.integrityOk') : t('security.alerts.integrityWarn'),
        result.ok ? t('security.alerts.integrityOkDesc') : result.details.join('\n'),
      );
    } catch (error) {
      Alert.alert(t('security.alerts.integrityFail'), error instanceof Error ? error.message : t('security.alerts.retrySimple'));
    } finally {
      setCheckingDatabase(false);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title={t('security.title')} subtitle={t('security.subtitle')} back />
      <AppCard>
        <AppText variant="subtitle">{pinEnabled ? t('security.pin.change') : t('security.pin.activate')}</AppText>
        <AppText muted>
          {pinEnabled ? t('security.pin.enabled') : t('security.pin.disabled')}
        </AppText>
      </AppCard>

      <AppCard>
        <AppText variant="subtitle">{pinEnabled ? t('security.pin.change') : t('security.pin.activate')}</AppText>
        {pinEnabled ? (
          <InputField
            label={t('security.pin.current')}
            value={currentPin}
            onChangeText={(value) => setCurrentPin(normalizePinInput(value))}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
        ) : null}
        <InputField
          label={pinEnabled ? t('security.pin.next') : t('security.pin.next')}
          value={newPin}
          onChangeText={(value) => setNewPin(normalizePinInput(value))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        <InputField
          label={t('security.pin.confirm')}
          value={confirmPin}
          onChangeText={(value) => setConfirmPin(normalizePinInput(value))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        <View style={styles.actions}>
          <AppButton title={pinEnabled ? t('security.pin.save') : t('security.pin.activate')} loading={savingPin} onPress={pinEnabled ? changePin : enablePin} />
          {pinEnabled ? <AppButton title={t('security.pin.disable')} variant="danger" loading={savingPin} onPress={disablePin} /> : null}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="subtitle">{t('security.privacyTitle')}</AppText>
        <AppText muted>{t('security.privacyDesc')}</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">{t('security.optimizeTitle')}</AppText>
        <AppText muted>{t('security.optimizeDesc')}</AppText>
        <AppButton title={t('security.optimizeNow')} variant="secondary" loading={optimizing} onPress={handleOptimizeStorage} />
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">{t('security.verifyTitle')}</AppText>
        <AppText muted>{t('security.verifyDesc')}</AppText>
        <AppButton title={t('security.verifyNow')} variant="secondary" loading={checkingDatabase} onPress={handleCheckDatabase} />
      </AppCard>
      <AppCard>
        <AppText variant="subtitle">{t('security.clearTitle')}</AppText>
        <AppText muted>{t('security.clearDesc')}</AppText>
        <HoldToConfirmButton
          title={t('security.clearHold')}
          holdTitle={t('security.clearHoldActive')}
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
