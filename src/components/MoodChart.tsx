import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText, Rect, G } from 'react-native-svg';
import { MoodChartPoint } from '../types';
import { Colors, FontSize, Spacing, BorderRadius, MOOD_OPTIONS } from '../constants/theme';

interface MoodChartProps {
  points: MoodChartPoint[];
}

export const MoodChart: React.FC<MoodChartProps> = ({ points }) => {
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

  // Y座標計算 (Level 1: 上部, Level 5: 下部)
  const getYCoordinate = (level: number): number => {
    // level: 1 -> y = paddingTop
    // level: 5 -> y = paddingTop + chartHeight
    return paddingTop + ((level - 1) / 4) * chartHeight;
  };

  // X座標計算
  const getXCoordinate = (index: number): number => {
    if (points.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (points.length - 1)) * chartWidth;
  };

  // 有効なデータポイントの座標リスト作成
  const validCoordinates: { x: number; y: number; mood: number; label: string; dateKey: string }[] = [];
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

  // Polyline用の points 文字列生成
  const polylinePointsString = validCoordinates.map((c) => `${c.x},${c.y}`).join(' ');

  // X軸のラベル表示を制御 (30日の場合は適度に間引き)
  const shouldShowXLabel = (index: number): boolean => {
    if (points.length <= 7) return true;
    return index % 5 === 0 || index === points.length - 1;
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Text style={styles.title}>気分推移グラフ</Text>

      {containerWidth > 0 && (
        <Svg width={containerWidth} height={height}>
          {/* Y軸グリッド線 & 絵文字ラベル (Level 1〜5) */}
          {MOOD_OPTIONS.map((option) => {
            const y = getYCoordinate(option.level);
            return (
              <G key={`y-grid-${option.level}`}>
                {/* 破線グリッド */}
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={containerWidth - paddingRight}
                  y2={y}
                  stroke={Colors.border}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {/* 左側の絵文字ラベル */}
                <SvgText
                  x={paddingLeft - 12}
                  y={y + 4}
                  fontSize="12"
                  textAnchor="end"
                >
                  {option.emoji}
                </SvgText>
              </G>
            );
          })}

          {/* 折れ線 */}
          {validCoordinates.length > 1 && (
            <Polyline
              points={polylinePointsString}
              fill="none"
              stroke={Colors.primaryDark}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 各ポイントの円 */}
          {validCoordinates.map((pt, idx) => {
            const option = MOOD_OPTIONS.find((o) => o.level === pt.mood);
            const color = option ? option.color : Colors.primaryDark;
            return (
              <G key={`circle-point-${idx}`}>
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill={Colors.surface}
                  stroke={color}
                  strokeWidth="3"
                />
              </G>
            );
          })}

          {/* X軸のラベル (日付/曜日) */}
          {points.map((pt, idx) => {
            if (!shouldShowXLabel(idx)) return null;
            const x = getXCoordinate(idx);
            return (
              <SvgText
                key={`x-label-${idx}`}
                x={x}
                y={height - 8}
                fontSize="10"
                fill={Colors.textSecondary}
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
          <Text style={styles.emptyText}>この期間の記録データがありません</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    color: Colors.textLight,
  },
});
