import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { SecuritySettings } from '@/types';
import { normalizePinInput } from '@/utils/pinSecurity';
import { verifySecurityPin } from '@/utils/securePinStorage';

type Props = {
  security: SecuritySettings;
  onUnlock: () => void;
};

export function AppLock({ security, onUnlock }: Props) {
  const colors = useThemeColors();
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [checking, setChecking] = useState(false);

  const secondsLeft = useMemo(() => {
    if (!lockedUntil) return 0;
    return Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  }, [lockedUntil, now]);

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  async function unlock() {
    if (lockedUntil && Date.now() < lockedUntil) {
      Alert.alert(t('security.alerts.lockWait'), t('security.alerts.lockWaitDesc', { seconds: secondsLeft }));
      return;
    }

    try {
      setChecking(true);
      if (await verifySecurityPin(pin, security)) {
        setPin('');
        setFailedAttempts(0);
        setLockedUntil(null);
        onUnlock();
        return;
      }
    } catch {
      Alert.alert(t('security.alerts.lockFailTitle'), t('security.alerts.lockFailDesc'));
      return;
    } finally {
      setChecking(false);
    }

    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    setPin('');
    if (nextAttempts >= 5) {
      setNow(Date.now());
      setLockedUntil(Date.now() + 30000);
      setFailedAttempts(0);
      Alert.alert(t('security.alerts.lockBlockedTitle'), t('security.alerts.lockBlockedDesc'));
      return;
    }
    Alert.alert(t('security.alerts.lockWrong'), t('security.alerts.lockAttempt', { current: nextAttempts }));
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppCard>
        <View style={styles.header}>
          <AppText variant="title">{t('common.appLockTitle')}</AppText>
          <AppText muted>{t('common.appLockDesc')}</AppText>
        </View>
        <InputField
          label="PIN"
          value={pin}
          onChangeText={(value) => setPin(normalizePinInput(value))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          autoFocus
          onSubmitEditing={unlock}
        />
        {secondsLeft ? <AppText muted>{t('common.appLockRetry', { seconds: secondsLeft })}</AppText> : null}
        <AppButton title={t('common.appLockUnlock')} loading={checking} onPress={unlock} />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: spacing.md },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
});
