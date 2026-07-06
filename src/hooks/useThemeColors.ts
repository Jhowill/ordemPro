import { useColorScheme } from 'react-native';

import { darkColors, lightColors } from '@/constants/theme';

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

