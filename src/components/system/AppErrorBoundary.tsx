import { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { spacing, ThemeColors } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';

type Props = {
  children: ReactNode;
  colors: ThemeColors;
  title: string;
  description: string;
  buttonLabel: string;
  fallbackMessage: string;
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
        <AppText variant="title" style={styles.center}>{this.props.title}</AppText>
        <AppText muted style={styles.center}>{this.props.description}</AppText>
        <AppText variant="caption" color={colors.muted} style={styles.center}>{this.state.message || this.props.fallbackMessage}</AppText>
        <AppButton title={this.props.buttonLabel} onPress={this.reset} />
      </View>
    );
  }
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  const colors = useThemeColors();
  const { t } = useI18n();

  return <AppErrorBoundaryBase colors={colors} title={t('common.errorBoundaryTitle')} description={t('common.errorBoundaryDesc')} buttonLabel={t('common.retry')} fallbackMessage={t('common.errorBoundaryMessage')}>{children}</AppErrorBoundaryBase>;
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
