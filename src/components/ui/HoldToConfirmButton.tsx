import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppText } from './AppText';

type Props = {
  title: string;
  holdTitle?: string;
  completedTitle?: string;
  durationMs?: number;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function HoldToConfirmButton({ title, holdTitle, completedTitle = 'Confirmado', durationMs = 3000, loading, onConfirm }: Props) {
  const colors = useThemeColors();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const confirmedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);

  function clearTimers(resetProgress = true) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
    setHolding(false);
    if (resetProgress) setProgress(0);
  }

  function startHold() {
    if (loading || confirmedRef.current) return;
    confirmedRef.current = false;
    startedAtRef.current = Date.now();
    setHolding(true);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setProgress(Math.min(1, elapsed / durationMs));
    }, 80);
    timeoutRef.current = setTimeout(() => {
      confirmedRef.current = true;
      clearTimers(false);
      setProgress(1);
      try {
        Promise.resolve(onConfirm()).catch((error) => {
          confirmedRef.current = false;
          setProgress(0);
          console.warn('Confirmacao segurada falhou:', error);
        });
      } catch (error) {
        confirmedRef.current = false;
        setProgress(0);
        console.warn('Confirmacao segurada falhou:', error);
      }
    }, durationMs);
  }

  function cancelHold() {
    if (confirmedRef.current) return;
    clearTimers(true);
  }

  useEffect(() => () => clearTimers(true), []);

  const label = loading ? 'Limpando...' : progress >= 1 ? completedTitle : holding ? (holdTitle ?? 'Continue segurando...') : title;

  return (
    <Pressable
      onPressIn={startHold}
      onPressOut={cancelHold}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.danger, opacity: pressed && !loading ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.progress, { width: `${Math.round(progress * 100)}%` }]} />
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={colors.white} /> : null}
        <AppText variant="button" color={colors.white}>{label}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
