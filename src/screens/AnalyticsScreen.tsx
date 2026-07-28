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
import { MoodChart } from '../components/MoodChart';
import { MoodDistribution } from '../components/MoodDistribution';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';

export default function AnalyticsScreen() {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>感情の分析 📊</Text>
          <Text style={styles.subtitle}>過去の気分の推移と傾向を振り返りましょう</Text>
        </View>


        {/* 期間切替トグルボタン */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              timeRange === '7days' && styles.segmentButtonActive,
            ]}
            onPress={() => setTimeRange('7days')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                timeRange === '7days' && styles.segmentTextActive,
              ]}
            >
              過去 7 日間
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              timeRange === '30days' && styles.segmentButtonActive,
            ]}
            onPress={() => setTimeRange('30days')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                timeRange === '30days' && styles.segmentTextActive,
              ]}
            >
              過去 30 日間
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryDark} />
          </View>
        ) : (
          <>
            {/* サマリーカード */}
            <View style={[styles.summaryCard, Shadow.sm]}>
              <View style={styles.summaryTopRow}>
                <View style={styles.summaryBadge}>
                  <Text style={styles.summaryEmoji}>{summary.averageEmoji}</Text>
                  <View style={styles.summaryTextGroup}>
                    <Text style={styles.summaryLabel}>平均気分</Text>
                    <Text style={styles.summaryValue}>
                      {summary.averageLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countNumber}>{summary.totalCount}</Text>
                  <Text style={styles.countLabel}>件の記録</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.adviceText}>{summary.adviceMessage}</Text>
            </View>

            {/* 折れ線グラフ */}
            <MoodChart points={summary.chartPoints} />

            {/* 感情分布 */}
            <MoodDistribution
              distribution={summary.distribution}
              totalCount={summary.totalCount}
            />

            {/* 要因（タグ）別分析 */}
            {summary.tagAnalytics && summary.tagAnalytics.length > 0 ? (
              <View style={[styles.sectionCard, Shadow.sm]}>
                <Text style={styles.sectionTitle}>🏷️ 要因（タグ）別の感情傾向</Text>
                <Text style={styles.sectionSubtitle}>
                  タグごとの記録回数と平均気分
                </Text>
                <View style={styles.tagList}>
                  {summary.tagAnalytics.map((item) => (
                    <View key={item.tagName} style={styles.tagRow}>
                      <View style={styles.tagLabelGroup}>
                        <Text style={styles.tagNameText}>#{item.tagName}</Text>
                        <Text style={styles.tagCountText}>{item.count}件</Text>
                      </View>

                      <View style={styles.tagMoodGroup}>
                        <Text style={styles.tagEmoji}>{item.averageEmoji}</Text>
                        <Text style={styles.tagMoodText}>
                          {item.averageLabel}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
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
  segmentButtonActive: {
    backgroundColor: Colors.surface,
  },
  segmentText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
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
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  countBadge: {
    alignItems: 'flex-end',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  countNumber: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.secondaryDark,
  },
  countLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  adviceText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
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
    borderBottomColor: Colors.divider,
  },
  tagLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tagNameText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  tagCountText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    backgroundColor: Colors.tagBg,
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
    color: Colors.textSecondary,
  },
});
