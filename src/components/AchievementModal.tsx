import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AchievementBadge, AchievementCategory } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';

interface AchievementModalProps {
  visible: boolean;
  onClose: () => void;
  badges: AchievementBadge[];
  currentStreak: number;
}

type FilterCategory = 'all' | AchievementCategory;

const CATEGORY_TABS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'streak', label: '連続' },
  { key: 'total', label: '累計' },
  { key: 'selfcare', label: 'セルフケア' },
  { key: 'special', label: 'スペシャル' },
];

export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  onClose,
  badges,
  currentStreak,
}) => {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

  const unlockedCount = badges.filter((b) => b.unlockedAt !== null).length;
  const totalCount = badges.length;
  const progressPercent = Math.round((unlockedCount / (totalCount || 1)) * 100);

  const filteredBadges = badges.filter((badge) => {
    if (selectedCategory === 'all') return true;
    return badge.category === selectedCategory;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        {/* ヘッダー */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.surface, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            アチーブメント
          </Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* サマリーカード */}
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                  獲得バッジ進捗
                </Text>
                <Text
                  style={[styles.summarySubtitle, { color: colors.textSecondary }]}
                >
                  {unlockedCount} / {totalCount} 個のバッジを獲得済み
                </Text>
              </View>
              <Text style={[styles.streakBadgeText, { color: colors.primaryDark }]}>
                🔥 連続 {currentStreak} 日
              </Text>
            </View>

            {/* プログレスバー */}
            <View style={[styles.progressBarBg, { backgroundColor: colors.divider }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: colors.primaryDark,
                  },
                ]}
              />
            </View>
          </View>

          {/* カテゴリフィルタータブ */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabContainer}
          >
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: isActive
                        ? colors.primaryDark
                        : colors.surface,
                      borderColor: isActive ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isActive
                          ? '#FFFFFF'
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* バッジ一覧 */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            バッジコレクション ({filteredBadges.length})
          </Text>

          <View style={styles.badgeGrid}>
            {filteredBadges.map((badge) => {
              const isUnlocked = badge.unlockedAt !== null;
              const percent = Math.min(
                100,
                Math.round((badge.currentCount / badge.targetCount) * 100)
              );

              return (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isUnlocked
                        ? colors.primaryDark
                        : colors.border,
                      opacity: isUnlocked ? 1 : 0.65,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      {
                        backgroundColor: isUnlocked
                          ? `${colors.primary}30`
                          : colors.divider,
                      },
                    ]}
                  >
                    <Text style={styles.badgeIcon}>
                      {isUnlocked ? badge.icon : '🔒'}
                    </Text>
                  </View>

                  <Text
                    style={[styles.badgeTitle, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {badge.title}
                  </Text>
                  <Text
                    style={[
                      styles.badgeDescription,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {badge.description}
                  </Text>

                  {/* 進捗 or 獲得日 */}
                  {isUnlocked ? (
                    <View
                      style={[
                        styles.unlockedPill,
                        { backgroundColor: `${colors.success}30` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.unlockedPillText,
                          { color: colors.textPrimary },
                        ]}
                      >
                        達成済み
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.miniProgressBg,
                          { backgroundColor: colors.divider },
                        ]}
                      >
                        <View
                          style={[
                            styles.miniProgressFill,
                            {
                              width: `${percent}%`,
                              backgroundColor: colors.primaryDark,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.progressText,
                          { color: colors.textLight },
                        ]}
                      >
                        {badge.currentCount}/{badge.targetCount}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  headerRightPlaceholder: {
    width: 32,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  summaryTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  summarySubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  streakBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  tabScrollView: {
    marginBottom: Spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tabPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeIcon: {
    fontSize: 26,
  },
  badgeTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    minHeight: 32,
  },
  unlockedPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: 'auto',
  },
  unlockedPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  miniProgressBg: {
    width: '100%',
    height: 4,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
