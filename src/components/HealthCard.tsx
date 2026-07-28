import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { HealthData } from '../types';
import { ThemeColors, Spacing, BorderRadius, FontSize, Shadow } from '../constants/theme';

interface HealthCardProps {
  colors: ThemeColors;
  enabled: boolean;
  onToggleEnabled: (value: boolean) => void;
  healthData: HealthData | null;
  loading: boolean;
  permissionDenied?: boolean;
  onRefresh: () => void;
  onOpenSettings?: () => void;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  colors,
  enabled,
  onToggleEnabled,
  healthData,
  loading,
  permissionDenied = false,
  onRefresh,
  onOpenSettings,
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>ヘルスケア連携</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {enabled ? '前日の睡眠・運動・歩数を自動取得中' : 'ヘルスケア自動連携はOFFです'}
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
          ) : permissionDenied ? (
            <View style={styles.deniedContainer}>
              <Text style={[styles.deniedText, { color: colors.textSecondary }]}>
                ヘルスケアへのアクセス権限が必要です。iOSの設定画面からアクセスを許可してください。
              </Text>
              {onOpenSettings && (
                <TouchableOpacity
                  style={[styles.settingsButton, { backgroundColor: colors.primary }]}
                  onPress={onOpenSettings}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.settingsButtonText, { color: '#FFFFFF' }]}>
                    ⚙️ iOS設定を開く
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : healthData ? (
            <View style={styles.dataGrid}>
              {/* 睡眠カード */}
              <View style={[styles.dataItem, { backgroundColor: colors.background }]}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIcon}>🌙</Text>
                  <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>睡眠時間</Text>
                </View>
                <Text style={[styles.itemValue, { color: colors.textPrimary }]}>
                  {healthData.sleepHours}
                  <Text style={styles.unitText}> 時間</Text>
                </Text>
              </View>

              {/* 運動・アクティブカロリーカード */}
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

              {/* 歩数カード */}
              <View style={[styles.dataItem, { backgroundColor: colors.background }]}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIcon}>👟</Text>
                  <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>歩数</Text>
                </View>
                <Text style={[styles.itemValue, { color: colors.textPrimary }]}>
                  {healthData.stepCount.toLocaleString()}
                  <Text style={styles.unitText}> 歩</Text>
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              昨日のヘルスケアデータが見つかりませんでした
            </Text>
          )}

          {enabled && !loading && !permissionDenied && (
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} activeOpacity={0.7}>
              <Text style={[styles.refreshText, { color: colors.primaryDark }]}>🔄 再読み込み</Text>
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
  deniedContainer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  deniedText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  settingsButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
  },
  settingsButtonText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  dataGrid: {
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemIcon: {
    fontSize: FontSize.sm,
  },
  itemLabel: {
    fontSize: FontSize.xs,
  },
  itemValue: {
    fontSize: FontSize.sm,
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
