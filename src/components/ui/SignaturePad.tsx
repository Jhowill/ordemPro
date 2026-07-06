import { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
  onSigningChange?: (signing: boolean) => void;
};

const minDistance = 2.2;
const strokeWidth = 3.4;

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clampPoint(point: Point, width: number, height: number) {
  return {
    x: Math.max(0, Math.min(width, point.x)),
    y: Math.max(0, Math.min(height, point.y)),
  };
}

function strokeToPath(stroke: Stroke) {
  if (!stroke.length) return '';
  if (stroke.length === 1) return `M ${stroke[0].x.toFixed(1)} ${stroke[0].y.toFixed(1)}`;
  if (stroke.length === 2) return `M ${stroke[0].x.toFixed(1)} ${stroke[0].y.toFixed(1)} L ${stroke[1].x.toFixed(1)} ${stroke[1].y.toFixed(1)}`;

  let path = `M ${stroke[0].x.toFixed(1)} ${stroke[0].y.toFixed(1)}`;
  for (let index = 1; index < stroke.length - 1; index += 1) {
    const current = stroke[index];
    const next = stroke[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    path += ` Q ${current.x.toFixed(1)} ${current.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = stroke[stroke.length - 1];
  path += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return path;
}

function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildSignatureSvgUri(paths: string[], width: number, height: number) {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const pathMarkup = paths.map((path) => `<path d="${path}" />`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}"><rect width="100%" height="100%" fill="white"/><g fill="none" stroke="#111827" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${pathMarkup}</g></svg>`;
  return encodeSvg(svg);
}

export function SignaturePad({ title = 'Assinar na tela', onSave, onCancel, onSigningChange }: Props) {
  const colors = useThemeColors();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [size, setSize] = useState({ width: 320, height: 220 });
  const strokesRef = useRef<Stroke[]>([]);
  const currentStroke = useRef<Stroke>([]);

  function updateStrokes(next: Stroke[]) {
    strokesRef.current = next;
    setStrokes(next);
  }

  const paths = useMemo(() => strokes.map(strokeToPath).filter(Boolean), [strokes]);
  const hasSignature = paths.length > 0;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          onSigningChange?.(true);
          const point = clampPoint({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY }, size.width, size.height);
          currentStroke.current = [point];
          updateStrokes([...strokesRef.current, currentStroke.current]);
        },
        onPanResponderMove: (event) => {
          const point = clampPoint({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY }, size.width, size.height);
          const last = currentStroke.current[currentStroke.current.length - 1];
          if (last && distance(last, point) < minDistance) return;
          currentStroke.current = [...currentStroke.current, point];
          updateStrokes([...strokesRef.current.slice(0, -1), currentStroke.current]);
        },
        onPanResponderRelease: () => {
          currentStroke.current = [];
          onSigningChange?.(false);
        },
        onPanResponderTerminate: () => {
          currentStroke.current = [];
          onSigningChange?.(false);
        },
      }),
    [onSigningChange, size.height, size.width],
  );

  function onLayout(event: LayoutChangeEvent) {
    setSize({
      width: Math.max(1, Math.round(event.nativeEvent.layout.width)),
      height: Math.max(1, Math.round(event.nativeEvent.layout.height)),
    });
  }

  function clear() {
    currentStroke.current = [];
    updateStrokes([]);
    onSigningChange?.(false);
  }

  function save() {
    if (!hasSignature) return;
    onSave(buildSignatureSvgUri(paths, size.width, size.height));
  }

  return (
    <View style={styles.wrap}>
      <AppText variant="subtitle">{title}</AppText>
      <View
        onLayout={onLayout}
        style={[styles.canvas, { backgroundColor: colors.surface, borderColor: hasSignature ? colors.primary : colors.border }]}
        {...panResponder.panHandlers}
      >
        {!hasSignature ? <AppText variant="caption" color={colors.muted} style={styles.hint}>Assine dentro do quadro</AppText> : null}
        <Svg width="100%" height="100%" viewBox={`0 0 ${size.width} ${size.height}`}>
          {paths.map((path, index) => (
            <Path key={`${index}_${path.length}`} d={path} fill="none" stroke={colors.text} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </Svg>
      </View>
      <View style={styles.row}>
        <AppButton title="Limpar" variant="secondary" compact onPress={clear} />
        {onCancel ? <AppButton title="Cancelar" variant="secondary" compact onPress={onCancel} /> : null}
        <AppButton title="Salvar assinatura" compact onPress={save} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  canvas: {
    height: 220,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  hint: { position: 'absolute', top: spacing.sm, alignSelf: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
