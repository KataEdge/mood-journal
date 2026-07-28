import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MoodDistributionItem } from '../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';

interface MoodDistributionProps {
  distribution: MoodDistributionItem[];
  totalCount: number;
}

export const MoodDistribution: React.FC<MoodDistributionProps> = ({ distribution, totalCount }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>感情の分布</Text>

      {distribution.map((item) => (
        <View key={`dist-${item.level}`} style={styles.row}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.label}>{item.label}</Text>

          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>

          <Text style={styles.countText}>
            {item.count}回 ({item.percentage}%)
          </Text>
        </View>
      ))}

      {totalCount === 0 && (
        <Text style={styles.emptyText}>データが登録されると分布が表示されます</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
    width: 70,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.border,
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
    color: Colors.textSecondary,
    width: 68,
    textAlign: 'right',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
