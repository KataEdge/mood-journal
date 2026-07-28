import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, StreakInfo, AchievementBadge } from '../types';

const UNLOCKED_BADGES_KEY = '@mood_journal_unlocked_badges';

/**
 * 初期アチーブメントバッジの定数定義
 */
export const INITIAL_BADGES: Omit<AchievementBadge, 'unlockedAt' | 'currentCount'>[] = [
  {
    id: 'first_step',
    title: 'はじめの一歩',
    description: '初めて感情を記録した',
    icon: '🌱',
    category: 'total',
    targetCount: 1,
  },
  {
    id: 'streak_3',
    title: '3日連続',
    description: '3日間続けて感情を記録した',
    icon: '🔥',
    category: 'streak',
    targetCount: 3,
  },
  {
    id: 'streak_7',
    title: '1週間マスター',
    description: '7日間続けて感情を記録した',
    icon: '🏆',
    category: 'streak',
    targetCount: 7,
  },
  {
    id: 'streak_30',
    title: '1ヶ月継続',
    description: '30日間続けて感情を記録した',
    icon: '🌟',
    category: 'streak',
    targetCount: 30,
  },
  {
    id: 'total_10',
    title: '感情の探求者',
    description: '累計10回記録した',
    icon: '📝',
    category: 'total',
    targetCount: 10,
  },
  {
    id: 'total_50',
    title: '感情マスター',
    description: '累計50回記録した',
    icon: '💎',
    category: 'total',
    targetCount: 50,
  },
  {
    id: 'selfcare_breathing',
    title: 'マインドフルネス',
    description: '4-7-8呼吸法を完了した',
    icon: '🫁',
    category: 'selfcare',
    targetCount: 1,
  },
  {
    id: 'tag_user',
    title: '感情の整理家',
    description: 'タグを付けて記録した',
    icon: '🏷️',
    category: 'special',
    targetCount: 1,
  },
];

/**
 * 日付文字列 (YYYY-MM-DD) をローカルタイムゾーン基準で取得
 */
export const getLocalDateString = (dateInput: Date | string): string => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * ストリーク（連続記録日数）を計算する
 * - 今日または昨日に記録がある場合、連続記録が維持される
 */
export const calculateStreak = (entries: MoodEntry[]): StreakInfo => {
  if (!entries || entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastRecordedDate: '' };
  }

  // 記録日一覧 (YYYY-MM-DD) のユニーク集合（降順ソート）
  const uniqueDatesSet = new Set<string>();
  entries.forEach((e) => {
    uniqueDatesSet.add(getLocalDateString(e.timestamp));
  });

  const sortedDates = Array.from(uniqueDatesSet).sort((a, b) => (a < b ? 1 : -1));
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastRecordedDate: '' };
  }

  const todayStr = getLocalDateString(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  const lastRecordedDate = sortedDates[0];

  // 今日も昨日も記録がなければ連続記録は切れ（0日）
  const hasRecordedToday = sortedDates.includes(todayStr);
  const hasRecordedYesterday = sortedDates.includes(yesterdayStr);

  if (!hasRecordedToday && !hasRecordedYesterday) {
    return {
      currentStreak: 0,
      longestStreak: calculateLongestStreak(sortedDates),
      lastRecordedDate,
    };
  }

  // 直近基準日（今日記録済みなら今日、未記録なら昨日）
  let checkDate = new Date(hasRecordedToday ? todayStr : yesterdayStr);
  let streakCount = 0;

  while (true) {
    const dateStr = getLocalDateString(checkDate);
    if (uniqueDatesSet.has(dateStr)) {
      streakCount++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(streakCount, calculateLongestStreak(sortedDates));

  return {
    currentStreak: streakCount,
    longestStreak,
    lastRecordedDate,
  };
};

/**
 * 過去のすべての日の最長連続記録日数を算出
 */
const calculateLongestStreak = (sortedDatesDescending: string[]): number => {
  if (sortedDatesDescending.length === 0) return 0;
  // 昇順にソート
  const dates = [...sortedDatesDescending].reverse();
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    
    // 日付差（日単位）
    const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
};

/**
 * 解放済みバッジの保存データを取得
 */
export const getUnlockedBadgesMap = async (): Promise<Record<string, string>> => {
  try {
    const json = await AsyncStorage.getItem(UNLOCKED_BADGES_KEY);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error('Failed to load unlocked badges', error);
    return {};
  }
};

/**
 * 解放済みバッジを保存
 */
export const saveUnlockedBadgesMap = async (map: Record<string, string>): Promise<void> => {
  try {
    await AsyncStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Failed to save unlocked badges', error);
  }
};

/**
 * 全アチーブメントの現在のステータスを評価・計算する
 * @returns { badges: AchievementBadge[], newlyUnlocked: AchievementBadge[] }
 */
export const checkAndEvaluateBadges = async (
  entries: MoodEntry[],
  breathingCount: number = 0
): Promise<{ badges: AchievementBadge[]; newlyUnlocked: AchievementBadge[] }> => {
  const unlockedMap = await getUnlockedBadgesMap();
  const streakInfo = calculateStreak(entries);

  const totalEntries = entries.length;
  const hasTaggedEntry = entries.some((e) => e.tags && e.tags.length > 0);

  const newlyUnlocked: AchievementBadge[] = [];
  const updatedUnlockedMap = { ...unlockedMap };
  const nowISO = new Date().toISOString();

  const badges: AchievementBadge[] = INITIAL_BADGES.map((base) => {
    let currentCount = 0;

    switch (base.id) {
      case 'first_step':
        currentCount = totalEntries > 0 ? 1 : 0;
        break;
      case 'streak_3':
        currentCount = Math.min(streakInfo.currentStreak, 3);
        break;
      case 'streak_7':
        currentCount = Math.min(streakInfo.currentStreak, 7);
        break;
      case 'streak_30':
        currentCount = Math.min(streakInfo.currentStreak, 30);
        break;
      case 'total_10':
        currentCount = Math.min(totalEntries, 10);
        break;
      case 'total_50':
        currentCount = Math.min(totalEntries, 50);
        break;
      case 'selfcare_breathing':
        currentCount = breathingCount > 0 ? 1 : 0;
        break;
      case 'tag_user':
        currentCount = hasTaggedEntry ? 1 : 0;
        break;
      default:
        currentCount = 0;
    }

    const isUnlocked = currentCount >= base.targetCount;
    let unlockedAt = unlockedMap[base.id] || null;

    // 新規解禁判定
    if (isUnlocked && !unlockedAt) {
      unlockedAt = nowISO;
      updatedUnlockedMap[base.id] = unlockedAt;
      newlyUnlocked.push({
        ...base,
        currentCount,
        unlockedAt,
      });
    }

    return {
      ...base,
      currentCount,
      unlockedAt: isUnlocked ? (unlockedAt || nowISO) : null,
    };
  });

  // 新規解禁があればマップ更新保存
  if (newlyUnlocked.length > 0) {
    await saveUnlockedBadgesMap(updatedUnlockedMap);
  }

  return { badges, newlyUnlocked };
};
