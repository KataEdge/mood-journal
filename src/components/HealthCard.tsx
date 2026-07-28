import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { HealthData } from '../types';
import { ThemeColors, Spacing, BorderRadius, FontSize, Shadow } from '../constants/theme';

interface HealthCardProps {
  colors: ThemeColors;
  enabled: boolean;
  onToggleEnabled: (value: boolean) => void;
  healthData: HealthData | null;
  loading: boolean;
  onRefresh: () => void;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  colors,
  enabled,
  onToggleEnabled,
  healthData,
  loading,
  onRefresh,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Shadow.sm,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>❤️</Text>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              ヘルスケア連携
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {enabled ? '本日の睡眠・運動データを自動取得中' : 'ヘルスケア自動連携はOFFです'}
            </Text>
          </View>
        </View>

        <Switch
          value={enabled}
          onValueChange={onToggleEnabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {enabled && (
        <View style={[styles.content, { borderTopColor: colors.divider }]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                データ同期中...
              </Text>
            </View>
          ) : healthData ? (
            <View style={styles.dataGrid}>
              {/* 睡眠カード */}
              <View style={[styles.dataItem, { backgroundColor: colors.background }]}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIcon}>🌙</Text>
                  <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>
                    睡眠時間
                  </Text>
                </View>
                <Text style={[styles.itemValue, { color: colors.textPrimary }]}>
                  {healthData.sleepHours}
                  <Text style={styles.unitText}> 時間</Text>
                </Text>
              </View>

              {/* 運動カード */}
              <View style={[styles.dataItem, { backgroundColor: colors.background }]}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIcon}>🏃</Text>
                  <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>
                    運動・エネルギー
                  </Text>
                </View>
                <Text style={[styles.itemValue, { color: colors.textPrimary }]}>
                  {healthData.workoutMinutes}
                  <Text style={styles.unitText}> 分 </Text>
                  <Text style={[styles.subValue, { color: colors.textSecondary }]}>
                    ({healthData.activeCalories} kcal)
                  </Text>
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              データが取得できませんでした
            </Text>
          )}

          {enabled && !loading && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.7}
            >
              <Text style={[styles.refreshText, { color: colors.primaryDark }]}>
                🔄 再読み込み
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIcon: {
    fontSize: FontSize.xl,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  content: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
  },
  dataGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dataItem: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  itemIcon: {
    fontSize: FontSize.sm,
  },
  itemLabel: {
    fontSize: FontSize.xs,
  },
  itemValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  unitText: {
    fontSize: FontSize.xs,
    fontWeight: 'normal',
  },
  subValue: {
    fontSize: FontSize.xs,
    fontWeight: 'normal',
  },
  emptyText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  refreshButton: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
  },
  refreshText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
