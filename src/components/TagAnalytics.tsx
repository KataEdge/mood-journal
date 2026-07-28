import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TagAnalyticsItem } from '../types';
import { FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface TagAnalyticsProps {
  items: TagAnalyticsItem[];
}

export const TagAnalytics: React.FC<TagAnalyticsProps> = ({ items }) => {
  const { colors } = useTheme();

  if (!items || items.length === 0) {
    return null;
  }

  const positiveItems = items.filter((item) => item.category === 'positive');
  const negativeItems = items.filter((item) => item.category === 'negative');
  const neutralItems = items.filter((item) => item.category === 'neutral');

  const renderTagGroup = (
    title: string,
    subtitle: string,
    groupItems: TagAnalyticsItem[],
    accentColor: string,
    badgeBg: string
  ) => {
    if (groupItems.length === 0) return null;

    return (
      <View style={[styles.groupContainer, { backgroundColor: colors.background }]}>
        <View style={styles.groupHeader}>
          <Text style={[styles.groupTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.groupSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>

        <View style={styles.tagList}>
          {groupItems.map((item) => (
            <View key={item.tagName} style={[styles.tagRow, { borderBottomColor: colors.divider }]}>
              <View style={styles.tagLabelGroup}>
                <Text style={[styles.tagNameText, { color: colors.textPrimary }]}>
                  #{item.tagName}
                </Text>
                <Text
                  style={[styles.tagCountText, { color: accentColor, backgroundColor: badgeBg }]}
                >
                  {item.count}件
                </Text>
              </View>

              <View style={styles.tagMoodGroup}>
                <Text style={styles.tagEmoji}>{item.averageEmoji}</Text>
                <Text style={[styles.tagMoodText, { color: colors.textSecondary }]}>
                  {item.averageLabel}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface }, Shadow.sm]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        🏷️ 要因（タグ）別の感情傾向
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        記録されたタグと感情の相関・影響度
      </Text>

      {renderTagGroup(
        '🌟 気分を高める要因',
        'このタグの時はポジティブな気分が多い傾向があります',
        positiveItems,
        colors.primaryDark,
        colors.primary + '20'
      )}

      {renderTagGroup(
        '🌧️ 気分を下げがちな要因',
        'このタグの時は気分が下がり気味になる傾向があります',
        negativeItems,
        colors.error,
        colors.error + '25'
      )}

      {renderTagGroup(
        '😐 その他の要因',
        '安定した・中立的な感情の傾向です',
        neutralItems,
        colors.textSecondary,
        colors.tagBg
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  groupContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  groupHeader: {
    marginBottom: Spacing.xs,
  },
  groupTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  groupSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  tagList: {
    marginTop: Spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
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
    fontWeight: '600',
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
});
