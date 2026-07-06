import { ReactNode } from 'react';
import { Text, TextProps } from 'react-native';

import { typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

type Variant = keyof typeof typography;

type Props = TextProps & {
  children: ReactNode;
  variant?: Variant;
  muted?: boolean;
  color?: string;
};

export function AppText({ children, variant = 'body', muted, color, style, ...props }: Props) {
  const colors = useThemeColors();
  return (
    <Text {...props} style={[typography[variant], { color: color ?? (muted ? colors.muted : colors.text) }, style]}>
      {children}
    </Text>
  );
}

