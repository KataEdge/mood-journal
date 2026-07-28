import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MoodEntry } from '../types';
import { MOOD_OPTIONS, FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface MoodCardProps {
  entry: MoodEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: MoodEntry) => void;
}

export default function MoodCard({ entry, onDelete, onEdit }: MoodCardProps) {
  const { colors } = useTheme();

  const moodColorKey = `mood${entry.mood}` as 'mood1' | 'mood2' | 'mood3' | 'mood4' | 'mood5';
  const moodOption = MOOD_OPTIONS.find((m) => m.level === entry.mood);
  const moodColor = colors[moodColorKey] || colors.primary;

  const date = new Date(entry.timestamp);
  const timeString = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const confirmDelete = () => {
    Alert.alert(
      '記録を削除',
      'この記録を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => onDelete(entry.id),
        },
      ]
    );
  };

  const handleLongPress = () => {
    Alert.alert(
      '記録の操作',
      '選択した記録に対する操作を選んでください',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '編集',
          onPress: () => onEdit(entry),
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: moodColor }]}>
        <View style={styles.header}>
          <View style={[styles.emojiContainer, { backgroundColor: moodColor + '20' }]}>
            <Text style={styles.emoji}>{moodOption?.emoji || '😐'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.moodLabel, { color: colors.textPrimary }]}>{moodOption?.label || '記録'}</Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>{timeString}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onEdit(entry)}
            style={styles.editButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {entry.note ? (
          <Text style={[styles.note, { color: colors.textSecondary, borderTopColor: colors.divider }]}>{entry.note}</Text>
        ) : null}
        {entry.tags && entry.tags.length > 0 ? (
          <View style={styles.tagsContainer}>
            {entry.tags.map((tag) => (
              <View key={tag} style={[styles.tagBadge, { backgroundColor: colors.tagBg }]}>
                <Text style={[styles.tagBadgeText, { color: colors.tagText }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {entry.breathingSession ? (
          <View style={styles.breathingContainer}>
            <View style={[styles.breathingBadge, { backgroundColor: colors.primary + '30' }]}>
              <Text style={[styles.breathingBadgeText, { color: colors.textPrimary }]}>
                🍃 4-7-8呼吸法 ({entry.breathingSession.completedCycles}セット)
              </Text>
            </View>
          </View>
        ) : null}
        {entry.healthData ? (
          <View style={styles.healthContainer}>
            <View style={[styles.healthBadge, { backgroundColor: colors.primary + '25' }]}>
              <Text style={[styles.healthBadgeText, { color: colors.textPrimary }]}>
                🌙 {entry.healthData.sleepHours}時間
              </Text>
            </View>
            <View style={[styles.healthBadge, { backgroundColor: colors.secondary + '25' }]}>
              <Text style={[styles.healthBadgeText, { color: colors.textPrimary }]}>
                🏃 {entry.healthData.workoutMinutes}分 ({entry.healthData.activeCalories}kcal)
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  emoji: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  editButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  moodLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  time: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  note: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tagBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  breathingContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  breathingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  breathingBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  healthContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  healthBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  healthBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

