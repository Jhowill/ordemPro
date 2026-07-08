import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, AppStateStatus, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AppLock } from '@/components/security/AppLock';
import { AppErrorBoundary } from '@/components/system/AppErrorBoundary';
import { useI18n } from '@/hooks/useI18n';
import { AppDataProvider, useAppData } from '@/services/storage';
import { useIsDarkTheme, useThemeColors } from '@/hooks/useThemeColors';

function RootNavigator() {
  const { data, loading, loadError } = useAppData();
  const segments = useSegments();
  const colors = useThemeColors();
  const isDarkTheme = useIsDarkTheme();
  const { t } = useI18n();
  const didEvaluatePin = useRef(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);
  const [pinUnlocked, setPinUnlocked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!didEvaluatePin.current) {
      setPinUnlocked(!data.security.isPinEnabled);
      didEvaluatePin.current = true;
    }
    const inOnboarding = segments[0] === 'onboarding';
    if (!data.company?.isOnboardingCompleted && !inOnboarding) {
      router.replace('/onboarding/company');
    }
    if (data.company?.isOnboardingCompleted && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [data.company?.isOnboardingCompleted, data.security.isPinEnabled, loading, segments]);

  useEffect(() => {
    if (loading) return undefined;
    if (!data.security.isPinEnabled) {
      setPinUnlocked(true);
      return undefined;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasActive = appState.current === 'active';
      const isReturningToActive = appState.current.match(/inactive|background/) && nextState === 'active';

      if (wasActive && nextState.match(/inactive|background/)) {
        backgroundedAt.current = Date.now();
      }

      if (isReturningToActive && backgroundedAt.current && Date.now() - backgroundedAt.current > 60000) {
        setPinUnlocked(false);
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [data.security.isPinEnabled, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
        <AppText variant="subtitle">{t('common.appName')}</AppText>
        <AppText muted>{t('common.loadingData')}</AppText>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: colors.background }}>
        <AppText variant="title" style={{ textAlign: 'center' }}>{t('common.somethingWentWrong')}</AppText>
        <AppText muted style={{ textAlign: 'center' }}>{loadError}</AppText>
        <AppButton title={t('common.retry')} onPress={() => router.replace('/')} />
      </View>
    );
  }

  if (data.company?.isOnboardingCompleted && data.security.isPinEnabled && !pinUnlocked) {
    return <AppLock security={data.security} onUnlock={() => setPinUnlocked(true)} />;
  }

  return (
    <>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppDataProvider>
          <AppErrorBoundary>
            <RootNavigator />
          </AppErrorBoundary>
        </AppDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
