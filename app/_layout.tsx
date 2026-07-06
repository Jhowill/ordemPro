import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppDataProvider, useAppData } from '@/services/storage';
import { useThemeColors } from '@/hooks/useThemeColors';

function RootNavigator() {
  const { data, loading } = useAppData();
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
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

