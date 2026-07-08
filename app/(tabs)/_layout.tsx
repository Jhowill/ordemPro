import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function TabsLayout() {
  const colors = useThemeColors();
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="orders" options={{ title: t('tabs.orders'), tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="customers" options={{ title: t('tabs.customers'), tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="equipments" options={{ title: t('tabs.equipments'), tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings'), tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
