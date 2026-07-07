import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { SecuritySettings } from '@/types';
import { normalizePinInput, verifyPin } from '@/utils/pinSecurity';

type Props = {
  security: SecuritySettings;
  onUnlock: () => void;
};

export function AppLock({ security, onUnlock }: Props) {
  const colors = useThemeColors();
  const [pin, setPin] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const secondsLeft = useMemo(() => {
    if (!lockedUntil) return 0;
    return Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  }, [lockedUntil, now]);

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  function unlock() {
    if (lockedUntil && Date.now() < lockedUntil) {
      Alert.alert('Aguarde', `Tente novamente em ${secondsLeft}s.`);
      return;
    }

    if (verifyPin(pin, security.pinSalt, security.pinHash)) {
      setPin('');
      setFailedAttempts(0);
      setLockedUntil(null);
      onUnlock();
      return;
    }

    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    setPin('');
    if (nextAttempts >= 5) {
      setNow(Date.now());
      setLockedUntil(Date.now() + 30000);
      setFailedAttempts(0);
      Alert.alert('PIN bloqueado', 'Aguarde 30 segundos para tentar novamente.');
      return;
    }
    Alert.alert('PIN incorreto', `Tentativa ${nextAttempts} de 5.`);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppCard>
        <View style={styles.header}>
          <AppText variant="title">OrdemPro bloqueado</AppText>
          <AppText muted>Informe o PIN para acessar os dados locais.</AppText>
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
        {secondsLeft ? <AppText muted>Aguarde {secondsLeft}s para nova tentativa.</AppText> : null}
        <AppButton title="Desbloquear" onPress={unlock} />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: spacing.md },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
});
