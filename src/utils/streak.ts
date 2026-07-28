import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, StreakInfo, AchievementBadge, MindTreeInfo, WeeklyReportData } from '../types';

const UNLOCKED_BADGES_KEY = '@mood_journal_unlocked_badges';
const TREE_XP_KEY = '@mood_journal_tree_xp';
const STREAK_FREEZE_KEY = '@mood_journal_streak_freeze_info';

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
  {
    id: 'streak_14',
    title: '2週間コンスタント',
    description: '14日間続けて感情を記録した',
    icon: '🏅',
    category: 'streak',
    targetCount: 14,
  },
  {
    id: 'streak_60',
    title: '2ヶ月の習慣',
    description: '60日間続けて感情を記録した',
    icon: '👑',
    category: 'streak',
    targetCount: 60,
  },
  {
    id: 'total_100',
    title: '100の感情',
    description: '累計100回感情を記録した',
    icon: '💯',
    category: 'total',
    targetCount: 100,
  },
  {
    id: 'early_bird',
    title: '朝のひととき',
    description: '朝の時間帯（5〜9時）に記録した',
    icon: '🌅',
    category: 'special',
    targetCount: 1,
  },
  {
    id: 'night_owl',
    title: '夜のふりかえり',
    description: '夜の時間帯（21〜24時）に記録した',
    icon: '🌙',
    category: 'special',
    targetCount: 1,
  },
  {
    id: 'weekend_care',
    title: '週末のケア',
    description: '土曜日または日曜日に記録した',
    icon: '☕',
    category: 'special',
    targetCount: 1,
  },
  {
    id: 'all_moods',
    title: '全感情マスター',
    description: '5段階すべての気分を1回以上記録した',
    icon: '🌈',
    category: 'special',
    targetCount: 5,
  },
  {
    id: 'positive_streak',
    title: 'ハッピーデイ',
    description: '良い・とても良い気分を累計5回記録した',
    icon: '✨',
    category: 'special',
    targetCount: 5,
  },
  {
    id: 'writer',
    title: '思いをつづる',
    description: 'メモ付きで累計5回記録した',
    icon: '✍️',
    category: 'special',
    targetCount: 5,
  },
  {
    id: 'breathing_master',
    title: '深呼吸の達人',
    description: '4-7-8呼吸法を累計5回完了した',
    icon: '🫁',
    category: 'selfcare',
    targetCount: 5,
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

export interface CalendarStreakData {
  dateMoodMap: Record<string, MoodEntry[]>;
  streakDates: Set<string>;
}

/**
 * カレンダー表示用に、日付ごとの記録マップと連続ストリークに含まれる日付の集合を取得
 */
export const getCalendarStreakData = (entries: MoodEntry[]): CalendarStreakData => {
  const dateMoodMap: Record<string, MoodEntry[]> = {};
  if (!entries || entries.length === 0) {
    return { dateMoodMap, streakDates: new Set() };
  }

  // 日付文字列 (YYYY-MM-DD) ごとにエントリーをまとめる
  entries.forEach((entry) => {
    const dateStr = getLocalDateString(entry.timestamp);
    if (!dateMoodMap[dateStr]) {
      dateMoodMap[dateStr] = [];
    }
    dateMoodMap[dateStr].push(entry);
  });

  const uniqueDates = Object.keys(dateMoodMap);
  const uniqueDatesSet = new Set(uniqueDates);
  const streakDates = new Set<string>();

  uniqueDates.forEach((dateStr) => {
    const d = new Date(dateStr);
    const prev = new Date(d);
    prev.setDate(prev.getDate() - 1);
    const prevStr = getLocalDateString(prev);

    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const nextStr = getLocalDateString(next);

    // 前日または翌日に記録があれば連続記録（ストリーク）の一部とみなす
    if (uniqueDatesSet.has(prevStr) || uniqueDatesSet.has(nextStr)) {
      streakDates.add(dateStr);
    }
  });

  return { dateMoodMap, streakDates };
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

  const uniqueMoodsCount = new Set(entries.map((e) => e.mood)).size;
  const positiveCount = entries.filter((e) => e.mood === 4 || e.mood === 5).length;
  const notedCount = entries.filter((e) => e.note && e.note.trim().length > 0).length;

  const hasEarlyBirdEntry = entries.some((e) => {
    const hours = new Date(e.timestamp).getHours();
    return hours >= 5 && hours < 9;
  });
  const hasNightOwlEntry = entries.some((e) => {
    const hours = new Date(e.timestamp).getHours();
    return hours >= 21 && hours < 24;
  });
  const hasWeekendEntry = entries.some((e) => {
    const day = new Date(e.timestamp).getDay();
    return day === 0 || day === 6;
  });

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
      case 'streak_14':
        currentCount = Math.min(streakInfo.currentStreak, 14);
        break;
      case 'streak_30':
        currentCount = Math.min(streakInfo.currentStreak, 30);
        break;
      case 'streak_60':
        currentCount = Math.min(streakInfo.currentStreak, 60);
        break;
      case 'total_10':
        currentCount = Math.min(totalEntries, 10);
        break;
      case 'total_50':
        currentCount = Math.min(totalEntries, 50);
        break;
      case 'total_100':
        currentCount = Math.min(totalEntries, 100);
        break;
      case 'selfcare_breathing':
        currentCount = breathingCount > 0 ? 1 : 0;
        break;
      case 'breathing_master':
        currentCount = Math.min(breathingCount, 5);
        break;
      case 'tag_user':
        currentCount = hasTaggedEntry ? 1 : 0;
        break;
      case 'early_bird':
        currentCount = hasEarlyBirdEntry ? 1 : 0;
        break;
      case 'night_owl':
        currentCount = hasNightOwlEntry ? 1 : 0;
        break;
      case 'weekend_care':
        currentCount = hasWeekendEntry ? 1 : 0;
        break;
      case 'all_moods':
        currentCount = Math.min(uniqueMoodsCount, 5);
        break;
      case 'positive_streak':
        currentCount = Math.min(positiveCount, 5);
        break;
      case 'writer':
        currentCount = Math.min(notedCount, 5);
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

// ==========================================
// 🌳 ココロの木（Mind Tree）ロジック
// ==========================================

export const STAGE_THRESHOLDS = [
  { level: 1, minXp: 0, nextXp: 50, stageName: '芽ばえのココロ', emoji: '🌱' },
  { level: 2, minXp: 50, nextXp: 150, stageName: 'すこやか新緑', emoji: '🌿' },
  { level: 3, minXp: 150, nextXp: 300, stageName: 'のびやか若木', emoji: '🌳' },
  { level: 4, minXp: 300, nextXp: 500, stageName: 'おおらかな大木', emoji: '🌲' },
  { level: 5, minXp: 500, nextXp: 1000, stageName: 'まんかいの幸福木', emoji: '🌸' },
];

/**
 * 累計XPからココロの木の成長情報を計算
 */
export const calculateMindTreeInfo = (totalXp: number): MindTreeInfo => {
  let currentStage = STAGE_THRESHOLDS[0];
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= STAGE_THRESHOLDS[i].minXp) {
      currentStage = STAGE_THRESHOLDS[i];
      break;
    }
  }

  const currentLevelXp = Math.max(0, totalXp - currentStage.minXp);
  const xpNeeded = currentStage.nextXp - currentStage.minXp;

  return {
    level: currentStage.level,
    xp: totalXp,
    currentLevelXp,
    nextLevelXp: xpNeeded,
    stageName: currentStage.stageName,
    emoji: currentStage.emoji,
  };
};

/**
 * 保存済みTree XPの取得
 */
export const getStoredTreeXP = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(TREE_XP_KEY);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Failed to load tree XP', error);
    return 0;
  }
};

/**
 * Tree XPを追加保存する
 */
export const addTreeXP = async (amount: number): Promise<number> => {
  try {
    const current = await getStoredTreeXP();
    const updated = current + amount;
    await AsyncStorage.setItem(TREE_XP_KEY, updated.toString());
    return updated;
  } catch (error) {
    console.error('Failed to add tree XP', error);
    return 0;
  }
};

// ==========================================
// ❄️ ストリークフリーズ（1日救済チケット）ロジック
// ==========================================

interface StoredFreezeData {
  freezeAvailable: boolean;
  lastResetWeek: string; // ISO week key e.g. "2026-W30"
  lastFrozenDate: string | null;
}

/**
 * 年と日付からISO週番号キー (例: "2026-W30") を取得
 */
const getISOWeekKey = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

/**
 * ストリークフリーズのデータを取得（週1回の補充チェック付き）
 */
export const getStreakFreezeData = async (): Promise<StoredFreezeData> => {
  const currentWeekKey = getISOWeekKey(new Date());
  try {
    const json = await AsyncStorage.getItem(STREAK_FREEZE_KEY);
    if (json) {
      const data: StoredFreezeData = JSON.parse(json);
      // 週が変わっていれば補充
      if (data.lastResetWeek !== currentWeekKey) {
        const resetData: StoredFreezeData = {
          freezeAvailable: true,
          lastResetWeek: currentWeekKey,
          lastFrozenDate: data.lastFrozenDate,
        };
        await AsyncStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify(resetData));
        return resetData;
      }
      return data;
    }
  } catch (error) {
    console.error('Failed to load freeze data', error);
  }

  // 初期データ
  const initialData: StoredFreezeData = {
    freezeAvailable: true,
    lastResetWeek: currentWeekKey,
    lastFrozenDate: null,
  };
  try {
    await AsyncStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify(initialData));
  } catch (err) {
    console.error('Failed to init freeze data', err);
  }
  return initialData;
};

/**
 * フリーズ救済を適用して更新されたStreakInfoを計算する
 */
export const calculateStreakWithFreeze = async (entries: MoodEntry[]): Promise<StreakInfo> => {
  const baseStreak = calculateStreak(entries);
  const freezeData = await getStreakFreezeData();

  // 基本計算でストリークが0の場合、1日前だけ空いているか（昨日がスキップされ、2日前に記録があるか）チェック
  if (baseStreak.currentStreak === 0 && entries.length > 0 && freezeData.freezeAvailable) {
    const uniqueDatesSet = new Set(entries.map((e) => getLocalDateString(e.timestamp)));
    const todayStr = getLocalDateString(new Date());
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterdayDate);

    const twoDaysAgoDate = new Date();
    twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
    const twoDaysAgoStr = getLocalDateString(twoDaysAgoDate);

    // 今日・昨日に記録がないが、2日前に記録があり、昨日をフリーズ消費して救済できる場合
    if (!uniqueDatesSet.has(todayStr) && !uniqueDatesSet.has(yesterdayStr) && uniqueDatesSet.has(twoDaysAgoStr)) {
      // フリーズを自動消費して昨日に架空適用
      const updatedFreeze: StoredFreezeData = {
        ...freezeData,
        freezeAvailable: false,
        lastFrozenDate: yesterdayStr,
      };
      await AsyncStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify(updatedFreeze));

      // 2日前からのストリークを計算
      let checkDate = new Date(twoDaysAgoStr);
      let streakCount = 1; // 昨日はフリーズで補填
      while (true) {
        const dateStr = getLocalDateString(checkDate);
        if (uniqueDatesSet.has(dateStr)) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return {
        currentStreak: streakCount,
        longestStreak: Math.max(streakCount, baseStreak.longestStreak),
        lastRecordedDate: twoDaysAgoStr,
        freezeAvailable: false,
        lastFrozenDate: yesterdayStr,
      };
    }
  }

  return {
    ...baseStreak,
    freezeAvailable: freezeData.freezeAvailable,
    lastFrozenDate: freezeData.lastFrozenDate || undefined,
  };
};

// ==========================================
// 📊 週次感情レポート（Weekly Insight Report）
// ==========================================

export const getWeeklyReportData = (entries: MoodEntry[], weeklyXp: number = 0): WeeklyReportData => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);

  const startStr = getLocalDateString(sevenDaysAgo);
  const endStr = getLocalDateString(now);

  const weeklyEntries = entries.filter((e) => {
    const dateStr = getLocalDateString(e.timestamp);
    return dateStr >= startStr && dateStr <= endStr;
  });

  const uniqueDays = new Set(weeklyEntries.map((e) => getLocalDateString(e.timestamp)));
  const recordedDaysCount = uniqueDays.size;

  let averageLevel: number | null = null;
  let averageEmoji = '🌱';

  if (weeklyEntries.length > 0) {
    const sum = weeklyEntries.reduce((acc, curr) => acc + curr.mood, 0);
    averageLevel = Math.round((sum / weeklyEntries.length) * 10) / 10;

    if (averageLevel >= 4.5) averageEmoji = '😄';
    else if (averageLevel >= 3.5) averageEmoji = '🙂';
    else if (averageLevel >= 2.5) averageEmoji = '😐';
    else if (averageLevel >= 1.5) averageEmoji = '🙁';
    else averageEmoji = '😢';
  }

  // よく使われたタグ上位3つ
  const tagCounts: Record<string, number> = {};
  weeklyEntries.forEach((e) => {
    if (e.tags) {
      e.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);

  let message = '今週もお疲れ様でした！振り返りで心を整えましょう✨';
  if (recordedDaysCount >= 5) {
    message = '素晴らしい継続力です！ココロの木もすくすく育っています🌸';
  } else if (recordedDaysCount >= 3) {
    message = 'マイペースに記録を重ねられていますね。自分を大切にする習慣が身についています😊';
  } else if (recordedDaysCount >= 1) {
    message = '忙しい中でも記録を残せましたね！小さな一歩が心の支えになります🌿';
  }

  return {
    startDate: startStr,
    endDate: endStr,
    recordedDaysCount,
    totalEntries: weeklyEntries.length,
    averageLevel,
    averageEmoji,
    topTags,
    treeXpGained: weeklyXp,
    message,
  };
};

