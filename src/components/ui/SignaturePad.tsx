import { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

type Point = { x: number; y: number };
type Stroke = Point[];

type Props = {
  title?: string;
  onSave: (uri: string) => void;
  onCancel?: () => void;
};

function buildSignatureUri(strokes: Stroke[], width: number, height: number) {
  const polylines = strokes
    .filter((stroke) => stroke.length > 1)
    .map((stroke) => `<polyline points="${stroke.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')}" />`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/><g fill="none" stroke="#111827" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${polylines}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function SignaturePad({ title = 'Assinar na tela', onSave, onCancel }: Props) {
  const colors = useThemeColors();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [size, setSize] = useState({ width: 320, height: 180 });
  const currentStroke = useRef<Stroke>([]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const point = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
          currentStroke.current = [point];
          setStrokes((current) => [...current, [point]]);
        },
        onPanResponderMove: (event) => {
          const point = {
            x: Math.max(0, Math.min(size.width, event.nativeEvent.locationX)),
            y: Math.max(0, Math.min(size.height, event.nativeEvent.locationY)),
          };
          currentStroke.current = [...currentStroke.current, point];
          setStrokes((current) => [...current.slice(0, -1), currentStroke.current]);
        },
        onPanResponderRelease: () => {
          currentStroke.current = [];
        },
      }),
    [size.height, size.width],
  );

  function onLayout(event: LayoutChangeEvent) {
    setSize({
      width: Math.max(1, Math.round(event.nativeEvent.layout.width)),
      height: Math.max(1, Math.round(event.nativeEvent.layout.height)),
    });
  }

  function save() {
    if (!strokes.some((stroke) => stroke.length > 1)) return;
    onSave(buildSignatureUri(strokes, size.width, size.height));
  }

  return (
    <View style={styles.wrap}>
      <AppText variant="subtitle">{title}</AppText>
      <View
        onLayout={onLayout}
        style={[styles.canvas, { backgroundColor: colors.surface, borderColor: colors.border }]}
        {...panResponder.panHandlers}
      >
        <AppText variant="caption" color={colors.muted} style={styles.hint}>Assine dentro do quadro</AppText>
        {strokes.flatMap((stroke, strokeIndex) =>
          stroke.map((point, pointIndex) => (
            <View
              key={`${strokeIndex}_${pointIndex}`}
              style={[
                styles.dot,
                {
                  backgroundColor: colors.text,
                  left: point.x - 1.8,
                  top: point.y - 1.8,
                },
              ]}
            />
          )),
        )}
      </View>
      <View style={styles.row}>
        <AppButton title="Limpar" variant="secondary" compact onPress={() => setStrokes([])} />
        {onCancel ? <AppButton title="Cancelar" variant="secondary" compact onPress={onCancel} /> : null}
        <AppButton title="Salvar assinatura" compact onPress={save} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  canvas: {
    height: 180,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  hint: { position: 'absolute', top: spacing.sm, alignSelf: 'center' },
  dot: { position: 'absolute', width: 3.6, height: 3.6, borderRadius: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
