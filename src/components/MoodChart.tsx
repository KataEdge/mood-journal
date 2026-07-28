import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText, G } from 'react-native-svg';
import { MoodChartPoint } from '../types';
import { FontSize, Spacing, BorderRadius, MOOD_OPTIONS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface MoodChartProps {
  points: MoodChartPoint[];
}

export const MoodChart: React.FC<MoodChartProps> = ({ points }) => {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const height = 180;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const chartWidth = Math.max(containerWidth - paddingLeft - paddingRight, 0);
  const chartHeight = height - paddingTop - paddingBottom;

  const getYCoordinate = (level: number): number => {
    return paddingTop + ((5 - level) / 4) * chartHeight;
  };

  const getXCoordinate = (index: number): number => {
    if (points.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (points.length - 1)) * chartWidth;
  };

  const validCoordinates: { x: number; y: number; mood: number; label: string; dateKey: string }[] =
    [];
  points.forEach((pt, idx) => {
    if (pt.mood !== null) {
      validCoordinates.push({
        x: getXCoordinate(idx),
        y: getYCoordinate(pt.mood),
        mood: pt.mood,
        label: pt.dateLabel,
        dateKey: pt.dateKey,
      });
    }
  });

  const polylinePointsString = validCoordinates.map((c) => `${c.x},${c.y}`).join(' ');

  const shouldShowXLabel = (index: number): boolean => {
    if (points.length <= 7) return true;
    return index % 5 === 0 || index === points.length - 1;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} onLayout={onLayout}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>気分推移グラフ</Text>

      {containerWidth > 0 && (
        <Svg width={containerWidth} height={height}>
          {MOOD_OPTIONS.map((option) => {
            const y = getYCoordinate(option.level);
            return (
              <G key={`y-grid-${option.level}`}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={containerWidth - paddingRight}
                  y2={y}
                  stroke={colors.border}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <SvgText x={paddingLeft - 12} y={y + 4} fontSize="12" textAnchor="end">
                  {option.emoji}
                </SvgText>
              </G>
            );
          })}

          {validCoordinates.length > 1 && (
            <Polyline
              points={polylinePointsString}
              fill="none"
              stroke={colors.primaryDark}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {validCoordinates.map((pt, idx) => {
            const moodKey = `mood${pt.mood}` as keyof typeof colors;
            const pointColor = (colors[moodKey] as string) || colors.primaryDark;
            return (
              <G key={`circle-point-${idx}`}>
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill={colors.surface}
                  stroke={pointColor}
                  strokeWidth="3"
                />
              </G>
            );
          })}

          {points.map((pt, idx) => {
            if (!shouldShowXLabel(idx)) return null;
            const x = getXCoordinate(idx);
            return (
              <SvgText
                key={`x-label-${idx}`}
                x={x}
                y={height - 8}
                fontSize="10"
                fill={colors.textSecondary}
                textAnchor="middle"
              >
                {pt.dateLabel}
              </SvgText>
            );
          })}
        </Svg>
      )}

      {validCoordinates.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            この期間の記録データがありません
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginLeft: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
  },
});
