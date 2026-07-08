import { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { spacing, ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

type Props = {
  children: ReactNode;
  colors: ThemeColors;
};

type State = {
  hasError: boolean;
  message: string;
};

class AppErrorBoundaryBase extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Erro inesperado.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro inesperado no OrdemPro:', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    const { colors } = this.props;

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <AppText variant="title" style={styles.center}>Algo saiu do eixo</AppText>
        <AppText muted style={styles.center}>
          O OrdemPro evitou fechar sozinho. Tente novamente e, se continuar, reinicie o app.
        </AppText>
        <AppText variant="caption" color={colors.muted} style={styles.center}>{this.state.message}</AppText>
        <AppButton title="Tentar novamente" onPress={this.reset} />
      </View>
    );
  }
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  const colors = useThemeColors();

  return <AppErrorBoundaryBase colors={colors}>{children}</AppErrorBoundaryBase>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  center: { textAlign: 'center' },
});
