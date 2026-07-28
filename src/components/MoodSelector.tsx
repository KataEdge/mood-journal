import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MoodOption } from '../types';
import { MOOD_OPTIONS, FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface MoodSelectorProps {
  selectedMood: number | null;
  onSelect: (mood: MoodOption) => void;
}

export default function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  const { colors } = useTheme();

  const dynamicMoodOptions: MoodOption[] = MOOD_OPTIONS.map((opt) => {
    const moodColorKey = `mood${opt.level}` as 'mood1' | 'mood2' | 'mood3' | 'mood4' | 'mood5';
    return {
      ...opt,
      color: colors[moodColorKey],
    };
  });

  const scaleValues = React.useRef(dynamicMoodOptions.map(() => new Animated.Value(1))).current;

  const handlePress = (option: MoodOption, index: number) => {
    Animated.sequence([
      Animated.timing(scaleValues[index], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValues[index], {
        toValue: 1.15,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    scaleValues.forEach((val, i) => {
      if (i !== index) {
        Animated.spring(val, {
          toValue: 0.85,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }).start();
      }
    });

    onSelect(option);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>今の気分は？</Text>
      <View style={styles.moodRow}>
        {dynamicMoodOptions.map((option, index) => {
          const isSelected = selectedMood === option.level;
          return (
            <TouchableOpacity
              key={option.level}
              activeOpacity={0.7}
              onPress={() => handlePress(option, index)}
              style={styles.moodButton}
            >
              <Animated.View
                style={[
                  styles.emojiContainer,
                  { backgroundColor: colors.divider },
                  isSelected && {
                    backgroundColor: option.color + '30',
                    borderColor: option.color,
                    borderWidth: 2,
                  },
                  { transform: [{ scale: scaleValues[index] }] },
                ]}
              >
                <Text style={styles.emoji}>{option.emoji}</Text>
              </Animated.View>
              <Text
                style={[
                  styles.moodLabel,
                  { color: colors.textSecondary },
                  isSelected && { color: colors.textPrimary, fontWeight: '600' },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  label: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  moodButton: {
    alignItems: 'center',
    flex: 1,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  emoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
});
