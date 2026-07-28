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
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
  MOOD_OPTIONS,
} from '../constants/theme';

interface MoodStatsCardProps {
  entries: MoodEntry[];
}

export default function MoodStatsCard({ entries }: MoodStatsCardProps) {
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);

  const stats = calculateStats(entries, rangeDays);

  if (entries.length === 0) {
    return null;
  }

  // 平均スコア (1.0 〜 5.0, 5.0が最高「とても良い」)
  const getBarHeightPercent = (avgScore: number | null): number => {
    if (avgScore === null) return 0;
    return Math.max(15, (avgScore / 5) * 100);
  };

  const getMoodColor = (avgScore: number | null): string => {
    if (avgScore === null) return Colors.border;
    const roundedScore = Math.min(5, Math.max(1, Math.round(avgScore)));
    const targetLevel = (6 - roundedScore) as MoodLevel;
    const found = MOOD_OPTIONS.find((opt) => opt.level === targetLevel);
    return found ? found.color : Colors.primary;
  };

  return (
    <View style={styles.cardContainer}>
      {/* ヘッダー: タイトル & 期間切り替えタブ */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle}>感情のインサイト 📊</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, rangeDays === 7 && styles.activeTabButton]}
            onPress={() => setRangeDays(7)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, rangeDays === 7 && styles.activeTabText]}>
              週間 (7日)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, rangeDays === 30 && styles.activeTabButton]}
            onPress={() => setRangeDays(30)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, rangeDays === 30 && styles.activeTabText]}>
              月間 (30日)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* サマリー行: 平均スコア & 総記録数 */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>平均の気分</Text>
          <View style={styles.summaryValueContainer}>
            <Text style={styles.summaryEmoji}>
              {stats.representativeEmoji}
            </Text>
            <Text style={styles.summaryValue}>
              {stats.averageMood !== null ? `${stats.averageMood}` : '-'}
            </Text>
            <Text style={styles.summarySubtext}>/ 5.0</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>期間内の記録</Text>
          <View style={styles.summaryValueContainer}>
            <Text style={styles.summaryCountValue}>{stats.totalCount}</Text>
            <Text style={styles.summarySubtext}>件</Text>
          </View>
        </View>
      </View>

      {/* グラフ1: 気分の波（日別トレンド） */}
      <View style={styles.graphSection}>
        <Text style={styles.sectionSubTitle}>気分の移り変わり</Text>
        <View style={styles.chartContainer}>
          {stats.dailyPoints.map((pt, idx) => {
            const heightPercent = getBarHeightPercent(pt.averageMood);
            const barColor = getMoodColor(pt.averageMood);

            return (
              <View key={`${pt.fullDate}-${idx}`} style={styles.barColumn}>
                <View style={styles.barTrack}>
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
                    <View style={styles.emptyDot} />
                  )}
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {pt.dateLabel}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* グラフ2: 感情の分布（内訳） */}
      <View style={styles.distributionSection}>
        <Text style={styles.sectionSubTitle}>感情の内訳</Text>
        {stats.distribution.map((item) => {
          const moodOpt = MOOD_OPTIONS.find((o) => o.level === item.level);
          if (!moodOpt) return null;

          return (
            <View key={item.level} style={styles.distRow}>
              <Text style={styles.distEmoji}>{moodOpt.emoji}</Text>
              <Text style={styles.distLabel}>{moodOpt.label}</Text>
              <View style={styles.distTrack}>
                <View
                  style={[
                    styles.distFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: moodOpt.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.distPercent}>{item.percentage}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: BorderRadius.sm - 2,
  },
  activeTabButton: {
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  tabText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.border,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
  },
  summaryCountValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summarySubtext: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginLeft: 2,
  },
  graphSection: {
    marginBottom: Spacing.md,
  },
  sectionSubTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
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
    backgroundColor: Colors.divider,
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
    backgroundColor: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    width: 65,
  },
  distTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.divider,
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
    color: Colors.textSecondary,
    width: 35,
    textAlign: 'right',
  },
});
