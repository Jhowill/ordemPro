import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AppDataProvider, useAppData } from '@/services/storage';
import { useThemeColors } from '@/hooks/useThemeColors';

function RootNavigator() {
  const { data, loading, loadError } = useAppData();
  const segments = useSegments();
  const colors = useThemeColors();

  useEffect(() => {
    if (loading) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!data.company?.isOnboardingCompleted && !inOnboarding) {
      router.replace('/onboarding/company');
    }
    if (data.company?.isOnboardingCompleted && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [data.company?.isOnboardingCompleted, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
        <AppText variant="subtitle">OrdemPro</AppText>
        <AppText muted>Carregando dados locais...</AppText>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: colors.background }}>
        <AppText variant="title" style={{ textAlign: 'center' }}>Algo deu errado</AppText>
        <AppText muted style={{ textAlign: 'center' }}>{loadError}</AppText>
        <AppButton title="Tentar novamente" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppDataProvider>
          <RootNavigator />
        </AppDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
