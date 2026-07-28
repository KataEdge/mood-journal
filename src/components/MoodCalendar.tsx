import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MoodEntry } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import { getCalendarStreakData, getLocalDateString } from '../utils/streak';

interface MoodCalendarProps {
  entries: MoodEntry[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export const MoodCalendar: React.FC<MoodCalendarProps> = ({
  entries,
  selectedDate,
  onSelectDate,
}) => {
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);

  const { dateMoodMap, streakDates } = useMemo(
    () => getCalendarStreakData(entries),
    [entries]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleResetMonth = () => {
    setCurrentDate(new Date());
  };

  // 月の日付グリッド配列を計算
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
    }[] = [];

    // 前月の日付
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      days.push({
        dateStr: getLocalDateString(prevDate),
        dayNum,
        isCurrentMonth: false,
      });
    }

    // 当月の日付
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, month, d);
      days.push({
        dateStr: getLocalDateString(currDate),
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // 翌月の日付（6行×7日=42枠に満たない分を補完）
    const remainingSlots = 42 - days.length;
    for (let d = 1; d <= remainingSlots; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        dateStr: getLocalDateString(nextDate),
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

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
      {/* カレンダーヘッダー（年月表示・前後月移動） */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePrevMonth}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResetMonth} activeOpacity={0.8}>
          <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
            {year}年 {month + 1}月
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNextMonth}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* 曜日ヘッダー */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((wd, index) => {
          const isSunday = index === 0;
          const isSaturday = index === 6;
          return (
            <View key={wd} style={styles.weekdayCell}>
              <Text
                style={[
                  styles.weekdayText,
                  {
                    color: isSunday
                      ? colors.error
                      : isSaturday
                      ? colors.primaryDark
                      : colors.textLight,
                  },
                ]}
              >
                {wd}
              </Text>
            </View>
          );
        })}
      </View>

      {/* カレンダーグリッド */}
      <View style={styles.grid}>
        {calendarDays.map((item, index) => {
          const { dateStr, dayNum, isCurrentMonth } = item;
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          const dayEntries = dateMoodMap[dateStr] || [];
          const hasEntry = dayEntries.length > 0;
          const isStreak = streakDates.has(dateStr);

          // 最新エントリーの気分絵文字
          const latestMood = hasEntry ? dayEntries[0].mood : null;
          const moodEmoji = latestMood ? MOOD_EMOJIS[latestMood] || '😐' : null;

          return (
            <TouchableOpacity
              key={`${dateStr}-${index}`}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.dayCellOtherMonth,
                isStreak && isCurrentMonth && {
                  backgroundColor: `${colors.warning}22`,
                  borderColor: colors.warning,
                },
                isSelected && {
                  borderWidth: 2,
                  borderColor: colors.primaryDark,
                  backgroundColor: `${colors.primary}20`,
                },
              ]}
              onPress={() => {
                if (!isCurrentMonth) return;
                onSelectDate(isSelected ? null : dateStr);
              }}
              disabled={!isCurrentMonth}
              activeOpacity={0.7}
            >
              {/* 日付数値 */}
              <View style={styles.dayNumContainer}>
                <Text
                  style={[
                    styles.dayNumText,
                    {
                      color: !isCurrentMonth
                        ? colors.textLight
                        : isToday
                        ? colors.primaryDark
                        : colors.textPrimary,
                      fontWeight: isToday || isSelected ? '800' : '400',
                    },
                  ]}
                >
                  {dayNum}
                </Text>
                {isToday && <View style={[styles.todayDot, { backgroundColor: colors.primaryDark }]} />}
              </View>

              {/* 絵文字 / ストリークアイコン */}
              {isCurrentMonth && (
                <View style={styles.emojiContainer}>
                  {moodEmoji ? (
                    <Text style={styles.moodEmojiText}>{moodEmoji}</Text>
                  ) : (
                    <View style={styles.emptyDotPlaceholder} />
                  )}
                  {isStreak && (
                    <Text style={styles.streakFlameIcon}>🔥</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  monthTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  navButton: {
    padding: Spacing.xs,
  },
  weekdayRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 0.9,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.sm,
    marginVertical: 2,
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayNumContainer: {
    alignItems: 'center',
  },
  dayNumText: {
    fontSize: 11,
  },
  todayDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 1,
  },
  emojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 18,
  },
  moodEmojiText: {
    fontSize: 13,
  },
  streakFlameIcon: {
    fontSize: 9,
    position: 'absolute',
    top: -6,
    right: -6,
  },
  emptyDotPlaceholder: {
    height: 12,
  },
});
