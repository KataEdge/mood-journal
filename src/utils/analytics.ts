import {
  MoodEntry,
  TimeRange,
  AnalyticsSummary,
  MoodDistributionItem,
  MoodChartPoint,
  MoodLevel,
  TagAnalyticsCategory,
} from '../types';
import { MOOD_OPTIONS } from '../constants/theme';

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * ISO日付文字列から YYYY-MM-DD 形式に変換
 */
export const formatDateKey = (dateStr: string): string => {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 期間内の感情データを集計する
 */
export const calculateAnalyticsSummary = (
  entries: MoodEntry[],
  timeRange: TimeRange
): AnalyticsSummary => {
  const dayCount = timeRange === '7days' ? 7 : 30;
  const now = new Date();

  // 期間内の日付キー配列を生成（古い順: 過去 -> 今日）
  const dates: { dateKey: string; label: string }[] = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = formatDateKey(d.toISOString());

    let label = '';
    if (timeRange === '7days') {
      label = DAY_NAMES[d.getDay()];
    } else {
      label = `${d.getMonth() + 1}/${d.getDate()}`;
    }

    dates.push({ dateKey, label });
  }

  // 日付ごとのエントリマップを作成（同日に複数あれば最新を使用）
  const moodByDateMap = new Map<string, MoodLevel>();
  const filteredEntries: MoodEntry[] = [];
  const oldestDateKey = dates[0].dateKey;

  // entriesは降順(新しい順)と仮定
  entries.forEach((entry) => {
    const key = formatDateKey(entry.timestamp);
    if (key >= oldestDateKey) {
      filteredEntries.push(entry);
      if (!moodByDateMap.has(key)) {
        moodByDateMap.set(key, entry.mood);
      }
    }
  });

  // 折れ線グラフ用ポイント作成
  const chartPoints: MoodChartPoint[] = dates.map(({ dateKey, label }) => ({
    dateKey,
    dateLabel: label,
    mood: moodByDateMap.get(dateKey) ?? null,
  }));

  // 分布データ計算
  const totalCount = filteredEntries.length;
  const countMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumLevel = 0;

  filteredEntries.forEach((entry) => {
    countMap[entry.mood] = (countMap[entry.mood] || 0) + 1;
    sumLevel += entry.mood;
  });

  const distribution: MoodDistributionItem[] = MOOD_OPTIONS.map((opt) => {
    const count = countMap[opt.level] || 0;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return {
      level: opt.level,
      emoji: opt.emoji,
      label: opt.label,
      color: opt.color,
      count,
      percentage,
    };
  });

  // 平均気分計算
  let averageLevel: number | null = null;
  let averageEmoji = '✨';
  let averageLabel = '記録なし';
  let adviceMessage =
    'まだこの期間の記録がありません。毎日の気分を記録して傾向を分析してみましょう！';

  if (totalCount > 0) {
    averageLevel = Number((sumLevel / totalCount).toFixed(1));
    const roundedLevel = Math.min(Math.max(Math.round(averageLevel), 1), 5) as MoodLevel;
    const matchedOption = MOOD_OPTIONS.find((opt) => opt.level === roundedLevel);

    if (matchedOption) {
      averageEmoji = matchedOption.emoji;
      averageLabel = matchedOption.label;
    }

    if (averageLevel >= 4.2) {
      adviceMessage = '素晴らしい期間でしたね！好調なリズムを保ち、自分へのご褒美を忘れずに。';
    } else if (averageLevel >= 3.2) {
      adviceMessage =
        'とても良いペースで過ごせています。リラックスする時間も大切に過ごしましょう。';
    } else if (averageLevel >= 2.2) {
      adviceMessage =
        '安定した日々が続いています。心身の調子に気を配り、適度な息抜きを心がけましょう。';
    } else {
      adviceMessage =
        '少しお疲れ気味かもしれません。無理をせず、暖かくしてゆっくり休息を取りましょう。';
    }
  }

  // タグ別の集計
  const tagMap = new Map<string, { count: number; sumMood: number }>();
  filteredEntries.forEach((entry) => {
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.forEach((tag) => {
        const current = tagMap.get(tag) || { count: 0, sumMood: 0 };
        tagMap.set(tag, {
          count: current.count + 1,
          sumMood: current.sumMood + entry.mood,
        });
      });
    }
  });

  const tagAnalytics = Array.from(tagMap.entries())
    .map(([tagName, stat]) => {
      const avg = Number((stat.sumMood / stat.count).toFixed(1));
      const roundedLevel = Math.min(Math.max(Math.round(avg), 1), 5) as MoodLevel;
      const opt = MOOD_OPTIONS.find((m) => m.level === roundedLevel);

      let category: TagAnalyticsCategory = 'neutral';
      if (avg >= 3.5) {
        category = 'positive';
      } else if (avg <= 2.5) {
        category = 'negative';
      }

      return {
        tagName,
        count: stat.count,
        averageLevel: avg,
        averageEmoji: opt?.emoji || '😐',
        averageLabel: opt?.label || '普通',
        category,
      };
    })
    .sort((a, b) => b.count - a.count || (b.averageLevel || 0) - (a.averageLevel || 0));

  return {
    totalCount,
    averageLevel,
    averageEmoji,
    averageLabel,
    distribution,
    chartPoints,
    tagAnalytics,
    adviceMessage,
  };
};
