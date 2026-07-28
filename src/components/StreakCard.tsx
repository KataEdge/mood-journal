import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreakInfo } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';

interface StreakCardProps {
  streakInfo: StreakInfo;
  unlockedBadgeCount: number;
  totalBadgeCount: number;
  onPress: () => void;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streakInfo,
  unlockedBadgeCount,
  totalBadgeCount,
  onPress,
}) => {
  const { colors } = useTheme();

  const isStreakActive = streakInfo.currentStreak > 0;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isStreakActive
                ? `${colors.warning}30`
                : `${colors.textLight}20`,
            },
          ]}
        >
          <Text style={styles.emojiIcon}>
            {isStreakActive ? '🔥' : '🌱'}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.streakTitle, { color: colors.textPrimary }]}>
            {isStreakActive
              ? `${streakInfo.currentStreak}日 連続記録中！`
              : '連続記録に挑戦しよう'}
          </Text>
          <Text style={[styles.streakSubtitle, { color: colors.textSecondary }]}>
            最長記録: {streakInfo.longestStreak}日
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.pillsColumn}>
          {streakInfo.freezeAvailable && (
            <View
              style={[
                styles.freezePill,
                {
                  backgroundColor: '#E0F2FE',
                  borderColor: '#0284C7',
                },
              ]}
            >
              <Text style={styles.freezeEmoji}>❄️</Text>
              <Text style={[styles.freezeText, { color: '#0369A1' }]}>1日救済あり</Text>
            </View>
          )}
          <View
            style={[
              styles.badgePill,
              {
                backgroundColor: `${colors.primary}25`,
                borderColor: colors.primaryDark,
              },
            ]}
          >
            <Ionicons name="trophy-outline" size={12} color={colors.primaryDark} />
            <Text style={[styles.badgePillText, { color: colors.primaryDark }]}>
              {unlockedBadgeCount}/{totalBadgeCount}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm + 2,
  },
  emojiIcon: {
    fontSize: 22,
  },
  textContainer: {
    justifyContent: 'center',
    flex: 1,
    flexShrink: 1,
  },
  streakTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    lineHeight: 22,
  },
  streakSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  pillsColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs + 4,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: FontSize.xs - 1,
    fontWeight: '700',
    marginLeft: 3,
  },
  freezePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  freezeEmoji: {
    fontSize: 10,
    marginRight: 2,
  },
  freezeText: {
    fontSize: FontSize.xs - 1,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 4,
  },
});
