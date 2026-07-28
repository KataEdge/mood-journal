import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MoodEntry, MoodLevel } from '../types';
import { calculateStats } from '../utils/stats';
import {
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
  MOOD_OPTIONS,
} from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface MoodStatsCardProps {
  entries: MoodEntry[];
}

export default function MoodStatsCard({ entries }: MoodStatsCardProps) {
  const { colors } = useTheme();
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);

  const stats = calculateStats(entries, rangeDays);

  if (entries.length === 0) {
    return null;
  }

  const getBarHeightPercent = (avgScore: number | null): number => {
    if (avgScore === null) return 0;
    return Math.max(15, (avgScore / 5) * 100);
  };

  const getMoodColor = (avgScore: number | null): string => {
    if (avgScore === null) return colors.border;
    const roundedScore = Math.min(5, Math.max(1, Math.round(avgScore)));
    const targetLevel = (6 - roundedScore) as MoodLevel;
    const moodKey = `mood${targetLevel}` as keyof typeof colors;
    return (colors[moodKey] as string) || colors.primary;
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* ヘッダー: タイトル & 期間切り替えタブ */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>感情のインサイト 📊</Text>
        </View>

        <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.tabButton, rangeDays === 7 && { backgroundColor: colors.surface }, rangeDays === 7 && Shadow.sm]}
            onPress={() => setRangeDays(7)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, { color: colors.textSecondary }, rangeDays === 7 && { color: colors.textPrimary, fontWeight: '700' }]}>
              週間 (7日)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, rangeDays === 30 && { backgroundColor: colors.surface }, rangeDays === 30 && Shadow.sm]}
            onPress={() => setRangeDays(30)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, { color: colors.textSecondary }, rangeDays === 30 && { color: colors.textPrimary, fontWeight: '700' }]}>
              月間 (30日)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* サマリー行: 平均スコア & 総記録数 */}
      <View style={[styles.summaryRow, { backgroundColor: colors.background }]}>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>平均の気分</Text>
          <View style={styles.summaryValueContainer}>
            <Text style={styles.summaryEmoji}>
              {stats.representativeEmoji}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {stats.averageMood !== null ? `${stats.averageMood}` : '-'}
            </Text>
            <Text style={[styles.summarySubtext, { color: colors.textLight }]}>/ 5.0</Text>
          </View>
        </View>

        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryBox}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>期間内の記録</Text>
          <View style={styles.summaryValueContainer}>
            <Text style={[styles.summaryCountValue, { color: colors.textPrimary }]}>{stats.totalCount}</Text>
            <Text style={[styles.summarySubtext, { color: colors.textLight }]}>件</Text>
          </View>
        </View>
      </View>

      {/* グラフ1: 気分の波（日別トレンド） */}
      <View style={styles.graphSection}>
        <Text style={[styles.sectionSubTitle, { color: colors.textSecondary }]}>気分の移り変わり</Text>
        <View style={styles.chartContainer}>
          {stats.dailyPoints.map((pt, idx) => {
            const heightPercent = getBarHeightPercent(pt.averageMood);
            const barColor = getMoodColor(pt.averageMood);

            return (
              <View key={`${pt.fullDate}-${idx}`} style={styles.barColumn}>
                <View style={[styles.barTrack, { backgroundColor: colors.divider }]}>
                  {pt.averageMood !== null ? (
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  ) : (
                    <View style={[styles.emptyDot, { backgroundColor: colors.textLight }]} />
                  )}
                </View>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                  {pt.dateLabel}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* グラフ2: 感情の分布（内訳） */}
      <View style={styles.distributionSection}>
        <Text style={[styles.sectionSubTitle, { color: colors.textSecondary }]}>感情の内訳</Text>
        {stats.distribution.map((item) => {
          const moodOpt = MOOD_OPTIONS.find((o) => o.level === item.level);
          if (!moodOpt) return null;

          const moodKey = `mood${item.level}` as keyof typeof colors;
          const moodColor = (colors[moodKey] as string) || moodOpt.color;

          return (
            <View key={item.level} style={styles.distRow}>
              <Text style={styles.distEmoji}>{moodOpt.emoji}</Text>
              <Text style={[styles.distLabel, { color: colors.textPrimary }]}>{moodOpt.label}</Text>
              <View style={[styles.distTrack, { backgroundColor: colors.divider }]}>
                <View
                  style={[
                    styles.distFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: moodColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.distPercent, { color: colors.textSecondary }]}>{item.percentage}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    ...Shadow.sm,
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: BorderRadius.sm - 2,
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: '70%',
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
  summaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  summaryEmoji: {
    fontSize: FontSize.lg,
    marginRight: Spacing.xs,
  },
  summaryValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  summaryCountValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  summarySubtext: {
    fontSize: FontSize.xs,
    marginLeft: 2,
  },
  graphSection: {
    marginBottom: Spacing.md,
  },
  sectionSubTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 110,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 12,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: BorderRadius.full,
  },
  emptyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  barLabel: {
    fontSize: 10,
    marginTop: Spacing.xs,
  },
  distributionSection: {
    marginTop: Spacing.xs,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  distEmoji: {
    fontSize: FontSize.sm,
    width: 22,
  },
  distLabel: {
    fontSize: FontSize.xs,
    width: 65,
  },
  distTrack: {
    flex: 1,
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing.xs,
  },
  distFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  distPercent: {
    fontSize: FontSize.xs,
    width: 35,
    textAlign: 'right',
  },
});

