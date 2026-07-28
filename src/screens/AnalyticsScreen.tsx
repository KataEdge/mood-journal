import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MoodEntry, TimeRange } from '../types';
import { getMoodEntries } from '../utils/storage';
import { calculateAnalyticsSummary } from '../utils/analytics';
import { calculateHealthStats } from '../utils/stats';
import { MoodChart } from '../components/MoodChart';
import { MoodDistribution } from '../components/MoodDistribution';
import { TagAnalytics } from '../components/TagAnalytics';
import { ThemeHeader } from '../components/ThemeHeader';
import { FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMoodEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load mood entries for analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const summary = calculateAnalyticsSummary(entries, timeRange);
  const healthStats = calculateHealthStats(entries);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <ThemeHeader title="感情の分析 📊" subtitle="過去の気分の推移と傾向を振り返りましょう" />

        {/* 期間切替トグルボタン */}
        <View style={[styles.segmentContainer, { backgroundColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              timeRange === '7days' && { backgroundColor: colors.surface },
            ]}
            onPress={() => setTimeRange('7days')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                { color: colors.textSecondary },
                timeRange === '7days' && { color: colors.primaryDark, fontWeight: '700' },
              ]}
            >
              過去 7 日間
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              timeRange === '30days' && { backgroundColor: colors.surface },
            ]}
            onPress={() => setTimeRange('30days')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                { color: colors.textSecondary },
                timeRange === '30days' && { color: colors.primaryDark, fontWeight: '700' },
              ]}
            >
              過去 30 日間
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryDark} />
          </View>
        ) : (
          <>
            {/* サマリーカード */}
            <View style={[styles.summaryCard, { backgroundColor: colors.surface }, Shadow.sm]}>
              <View style={styles.summaryTopRow}>
                <View style={styles.summaryBadge}>
                  <Text style={styles.summaryEmoji}>{summary.averageEmoji}</Text>
                  <View style={styles.summaryTextGroup}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      平均気分
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                      {summary.averageLabel}
                    </Text>
                  </View>
                </View>

                <View style={[styles.countBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.countNumber, { color: colors.secondaryDark }]}>
                    {summary.totalCount}
                  </Text>
                  <Text style={[styles.countLabel, { color: colors.textSecondary }]}>件の記録</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <Text style={[styles.adviceText, { color: colors.textPrimary }]}>
                {summary.adviceMessage}
              </Text>
            </View>

            {/* 折れ線グラフ */}
            <MoodChart points={summary.chartPoints} />

            {/* 感情分布 */}
            <MoodDistribution distribution={summary.distribution} totalCount={summary.totalCount} />

            {/* ヘルスケア分析・インサイト */}
            {healthStats.hasDataCount > 0 && (
              <View style={[styles.sectionCard, { backgroundColor: colors.surface }, Shadow.sm]}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  ❤️ ヘルスケアと感情のインサイト
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  記録された {healthStats.hasDataCount} 件のヘルスケアデータに基づく相関
                </Text>

                <View style={styles.healthStatsGrid}>
                  <View style={[styles.healthStatBox, { backgroundColor: colors.background }]}>
                    <Text style={styles.statBoxIcon}>🌙</Text>
                    <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>
                      {healthStats.averageSleepHours ?? '-'}{' '}
                      <Text style={styles.statBoxUnit}>h/日</Text>
                    </Text>
                    <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
                      平均睡眠時間
                    </Text>
                  </View>

                  <View style={[styles.healthStatBox, { backgroundColor: colors.background }]}>
                    <Text style={styles.statBoxIcon}>🏃</Text>
                    <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>
                      {healthStats.averageWorkoutMinutes ?? '-'}{' '}
                      <Text style={styles.statBoxUnit}>分/日</Text>
                    </Text>
                    <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
                      平均運動時間
                    </Text>
                  </View>

                  <View style={[styles.healthStatBox, { backgroundColor: colors.background }]}>
                    <Text style={styles.statBoxIcon}>👟</Text>
                    <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>
                      {healthStats.averageStepCount !== null
                        ? healthStats.averageStepCount.toLocaleString()
                        : '-'}{' '}
                      <Text style={styles.statBoxUnit}>歩/日</Text>
                    </Text>
                    <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
                      平均歩数
                    </Text>
                  </View>
                </View>

                {healthStats.goodMoodSleepHours !== null && (
                  <View style={[styles.insightNotice, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.insightNoticeText, { color: colors.textPrimary }]}>
                      💡 気分が「とても良い・良い」日の平均睡眠時間は{' '}
                      <Text style={{ fontWeight: '700' }}>
                        {healthStats.goodMoodSleepHours} 時間
                      </Text>{' '}
                      でした。
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 要因（タグ）別分析 */}
            <TagAnalytics items={summary.tagAnalytics} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: FontSize.xxxl,
    marginRight: Spacing.sm,
  },
  summaryTextGroup: {
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: FontSize.xs,
  },
  summaryValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  countBadge: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  countNumber: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  countLabel: {
    fontSize: 10,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  adviceText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
  },
  tagList: {
    marginTop: Spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
  },
  tagLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tagNameText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  tagCountText: {
    fontSize: FontSize.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagMoodGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagEmoji: {
    fontSize: FontSize.md,
    marginRight: 4,
  },
  tagMoodText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  healthStatsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  healthStatBox: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statBoxIcon: {
    fontSize: FontSize.lg,
    marginBottom: 2,
  },
  statBoxValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  statBoxUnit: {
    fontSize: FontSize.xs,
    fontWeight: 'normal',
  },
  statBoxLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  insightNotice: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  insightNoticeText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
