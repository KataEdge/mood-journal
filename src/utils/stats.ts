import { MoodEntry, MoodLevel } from '../types';
import { MOOD_OPTIONS } from '../constants/theme';

export interface DailyMoodPoint {
  dateLabel: string;
  fullDate: string;
  averageMood: number | null; // 1.0 〜 5.0 (5.0が最高「とても良い」)
  count: number;
}

export interface MoodDistribution {
  level: MoodLevel;
  count: number;
  percentage: number;
}

export interface StatsData {
  totalCount: number;
  averageMood: number | null; // 1.0 〜 5.0 (5.0が最高「とても良い」)
  representativeEmoji: string;
  dailyPoints: DailyMoodPoint[];
  distribution: MoodDistribution[];
}

/**
 * 指定された日数（7日または30日）の統計データを計算する
 * ※気分スコアは 5.0: とても良い 〜 1.0: 辛い として計算
 */
export function calculateStats(entries: MoodEntry[], days: number = 7): StatsData {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  // 1. 期間内のエントリを抽出
  const periodEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate;
  });

  const totalCount = periodEntries.length;

  // 2. 平均スコアの計算 (5: とても良い 〜 1: 辛い)
  let averageMood: number | null = null;
  let representativeEmoji = '✨';

  if (totalCount > 0) {
    const sum = periodEntries.reduce((acc, cur) => acc + cur.mood, 0);
    averageMood = Math.round((sum / totalCount) * 10) / 10;

    // 代表絵文字を決定
    const roundedScore = Math.min(5, Math.max(1, Math.round(averageMood)));
    const targetLevel = roundedScore as MoodLevel;
    const moodOpt = MOOD_OPTIONS.find((opt) => opt.level === targetLevel);
    if (moodOpt) {
      representativeEmoji = moodOpt.emoji;
    }
  }

  // 3. 日別ポイントデータ（過去N日分）
  const dailyPoints: DailyMoodPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayEntries = periodEntries.filter((entry) => {
      const entryDateStr = new Date(entry.timestamp).toISOString().split('T')[0];
      return entryDateStr === dateStr;
    });

    const dayCount = dayEntries.length;
    let dayAvg: number | null = null;

    if (dayCount > 0) {
      const sum = dayEntries.reduce((acc, cur) => acc + cur.mood, 0);
      dayAvg = Math.round((sum / dayCount) * 10) / 10;
    }

    // 表示ラベル設定
    let dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    if (days === 7) {
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      dateLabel = weekdays[d.getDay()];
    }

    dailyPoints.push({
      dateLabel,
      fullDate: dateStr,
      averageMood: dayAvg,
      count: dayCount,
    });
  }

  // 4. 感情分布（1〜5の各レベルのカウントと割合）
  const levelCounts: Record<MoodLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  periodEntries.forEach((entry) => {
    if (levelCounts[entry.mood] !== undefined) {
      levelCounts[entry.mood]++;
    }
  });

  const distribution: MoodDistribution[] = ([5, 4, 3, 2, 1] as MoodLevel[]).map((level) => {
    const count = levelCounts[level];
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { level, count, percentage };
  });

  return {
    totalCount,
    averageMood,
    representativeEmoji,
    dailyPoints,
    distribution,
  };
}

export interface HealthStats {
  hasDataCount: number;
  averageSleepHours: number | null;
  averageWorkoutMinutes: number | null;
  totalActiveCalories: number;
  goodMoodSleepHours: number | null;
}

/**
 * 過去のエントリからヘルスケアデータの統計サマリーを計算する
 */
export function calculateHealthStats(entries: MoodEntry[]): HealthStats {
  const entriesWithHealth = entries.filter((e) => e.healthData);
  const hasDataCount = entriesWithHealth.length;

  if (hasDataCount === 0) {
    return {
      hasDataCount: 0,
      averageSleepHours: null,
      averageWorkoutMinutes: null,
      totalActiveCalories: 0,
      goodMoodSleepHours: null,
    };
  }

  const totalSleep = entriesWithHealth.reduce((sum, e) => sum + (e.healthData?.sleepHours || 0), 0);
  const totalWorkout = entriesWithHealth.reduce((sum, e) => sum + (e.healthData?.workoutMinutes || 0), 0);
  const totalCalories = entriesWithHealth.reduce((sum, e) => sum + (e.healthData?.activeCalories || 0), 0);

  const averageSleepHours = Math.round((totalSleep / hasDataCount) * 10) / 10;
  const averageWorkoutMinutes = Math.round(totalWorkout / hasDataCount);

  // 気分が良い時（MoodLevel 5 または 4）の平均睡眠時間
  const goodMoodEntries = entriesWithHealth.filter((e) => e.mood === 5 || e.mood === 4);
  let goodMoodSleepHours: number | null = null;
  if (goodMoodEntries.length > 0) {
    const goodMoodSleepSum = goodMoodEntries.reduce((sum, e) => sum + (e.healthData?.sleepHours || 0), 0);
    goodMoodSleepHours = Math.round((goodMoodSleepSum / goodMoodEntries.length) * 10) / 10;
  }

  return {
    hasDataCount,
    averageSleepHours,
    averageWorkoutMinutes,
    totalActiveCalories: totalCalories,
    goodMoodSleepHours,
  };
}
