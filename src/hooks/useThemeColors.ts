import { useColorScheme } from 'react-native';

import { darkColors, lightColors } from '@/constants/theme';
import { useAppData } from '@/services/storage';

export function useThemeColors() {
  const { data } = useAppData();
  const systemTheme = useColorScheme();
  const resolvedTheme = data.themeMode === 'system' ? systemTheme : data.themeMode;

  return resolvedTheme === 'dark' ? darkColors : lightColors;
}

export function useIsDarkTheme() {
  const { data } = useAppData();
  const systemTheme = useColorScheme();
  const resolvedTheme = data.themeMode === 'system' ? systemTheme : data.themeMode;

  return resolvedTheme === 'dark';
}
