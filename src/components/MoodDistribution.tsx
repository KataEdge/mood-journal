import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MoodDistributionItem } from '../types';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface MoodDistributionProps {
  distribution: MoodDistributionItem[];
  totalCount: number;
}

export const MoodDistribution: React.FC<MoodDistributionProps> = ({ distribution, totalCount }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>感情の分布</Text>

      {distribution.map((item) => {
        const moodKey = `mood${item.level}` as keyof typeof colors;
        const moodColor = (colors[moodKey] as string) || item.color;

        return (
          <View key={`dist-${item.level}`} style={styles.row}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{item.label}</Text>

            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: moodColor,
                  },
                ]}
              />
            </View>

            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {item.count}回 ({item.percentage}%)
            </Text>
          </View>
        );
      })}

      {totalCount === 0 && (
        <Text style={[styles.emptyText, { color: colors.textLight }]}>データが登録されると分布が表示されます</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emoji: {
    fontSize: FontSize.lg,
    width: 28,
  },
  label: {
    fontSize: FontSize.xs,
    width: 70,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: FontSize.xs,
    width: 68,
    textAlign: 'right',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

