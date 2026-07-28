import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MindTreeInfo } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';

interface MindTreeCardProps {
  treeInfo: MindTreeInfo;
}

export const MindTreeCard: React.FC<MindTreeCardProps> = ({ treeInfo }) => {
  const { colors } = useTheme();

  const progress = Math.min(1, Math.max(0, treeInfo.currentLevelXp / treeInfo.nextLevelXp));
  const progressPercent = Math.round(progress * 100);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.treeBadge, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={styles.treeEmoji}>{treeInfo.emoji}</Text>
          </View>
          <View style={styles.textGroup}>
            <View style={styles.stageRow}>
              <Text style={[styles.stageName, { color: colors.textPrimary }]}>
                {treeInfo.stageName}
              </Text>
              <View style={[styles.levelTag, { backgroundColor: colors.primary }]}>
                <Text style={styles.levelTagText}>Lv.{treeInfo.level}</Text>
              </View>
            </View>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              累計水やり: {treeInfo.xp} XP
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            次の成長まで
          </Text>
          <Text style={[styles.progressValue, { color: colors.primaryDark }]}>
            {treeInfo.currentLevelXp} / {treeInfo.nextLevelXp} XP ({progressPercent}%)
          </Text>
        </View>

        <View style={[styles.track, { backgroundColor: `${colors.primary}20` }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: colors.primary,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  treeBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm + 2,
  },
  treeEmoji: {
    fontSize: 26,
  },
  textGroup: {
    flex: 1,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stageName: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  levelTag: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  levelTagText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs - 1,
    fontWeight: '700',
  },
  subText: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  progressSection: {
    marginTop: Spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: FontSize.xs,
  },
  progressValue: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
