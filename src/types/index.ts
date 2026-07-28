/**
 * 気分レベルの型定義
 * 1: とても良い 〜 5: とても悪い
 */
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

/**
 * 気分の記録エントリ
 */
export interface MoodEntry {
  id: string;
  mood: MoodLevel;
  note: string;
  timestamp: string; // ISO 8601
  tags?: string[];
}

/**
 * 感情要因タグの型定義
 */
export interface Tag {
  id: string;
  name: string;
  isCustom?: boolean;
}

/**
 * タグ別感情分析アイテム
 */
export interface TagAnalyticsItem {
  tagName: string;
  count: number;
  averageLevel: number | null;
  averageEmoji: string;
  averageLabel: string;
}

/**
 * 気分レベルに対応する絵文字とラベル
 */
export interface MoodOption {
  level: MoodLevel;
  emoji: string;
  label: string;
  color: string;
}

/**
 * リマインダー通知の設定
 */
export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

/**
 * 名言・偉人のセリフの型定義
 */
export interface Quote {
  text: string;
  author: string;
  authorTitle?: string;
}

/**
 * 統計データの集計対象期間
 */
export type TimeRange = '7days' | '30days';

/**
 * 感情ごとの分布データ
 */
export interface MoodDistributionItem {
  level: MoodLevel;
  emoji: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
}

/**
 * 日別のデータポイント（折れ線グラフ用）
 */
export interface MoodChartPoint {
  dateLabel: string;
  dateKey: string;
  mood: MoodLevel | null;
}

/**
 * 統計サマリー結果
 */
export interface AnalyticsSummary {
  totalCount: number;
  averageLevel: number | null;
  averageEmoji: string;
  averageLabel: string;
  distribution: MoodDistributionItem[];
  chartPoints: MoodChartPoint[];
  tagAnalytics: TagAnalyticsItem[];
  adviceMessage: string;
}

