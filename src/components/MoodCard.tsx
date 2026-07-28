import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { MoodEntry } from '../types';
import { MOOD_OPTIONS } from '../constants/theme';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme';

interface MoodCardProps {
  entry: MoodEntry;
  onDelete: (id: string) => void;
}

export default function MoodCard({ entry, onDelete }: MoodCardProps) {
  const moodOption = MOOD_OPTIONS.find((m) => m.level === entry.mood);
  const date = new Date(entry.timestamp);
  const timeString = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleLongPress = () => {
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

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View style={[styles.card, { borderLeftColor: moodOption?.color || Colors.primary }]}>
        <View style={styles.header}>
          <View style={[styles.emojiContainer, { backgroundColor: (moodOption?.color || Colors.primary) + '20' }]}>
            <Text style={styles.emoji}>{moodOption?.emoji || '😐'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.moodLabel}>{moodOption?.label || '記録'}</Text>
            <Text style={styles.time}>{timeString}</Text>
          </View>
        </View>
        {entry.note ? (
          <Text style={styles.note}>{entry.note}</Text>
        ) : null}
        {entry.tags && entry.tags.length > 0 ? (
          <View style={styles.tagsContainer}>
            {entry.tags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
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
  moodLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  note: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tagBadge: {
    backgroundColor: Colors.tagBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
