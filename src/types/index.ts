/**
 * 気分レベルの型定義
 * 5: とても良い 〜 1: 辛い
 */
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

/**
 * カラーテーマの型定義
 */
export type ThemeType = 'light' | 'dark' | 'warm';

/**
 * ヘルスケア（HealthKit）連携データ
 */
export interface HealthData {
  sleepHours: number; // 睡眠時間 (例: 7.5)
  workoutMinutes: number; // 運動時間 (例: 45)
  activeCalories: number; // アクティブエネルギー (例: 250)
  stepCount: number; // 歩数 (例: 8500)
  syncedAt: string; // 同期日時 (ISO 8601)
}

/**
 * 4-7-8呼吸法セッション情報
 */
export interface BreathingSession {
  completedCycles: number; // 完了したサイクル数 (例: 3)
  completedAt: string; // 実施完了日時 (ISO 8601)
}

/**
 * 気分の記録エントリ
 */
export interface MoodEntry {
  id: string;
  mood: MoodLevel;
  note: string;
  timestamp: string; // ISO 8601
  tags?: string[];
  healthData?: HealthData;
  breathingSession?: BreathingSession;
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
 * タグ別感情分析のカテゴリ分類
 */
export type TagAnalyticsCategory = 'positive' | 'negative' | 'neutral';

/**
 * タグ別感情分析アイテム
 */
export interface TagAnalyticsItem {
  tagName: string;
  count: number;
  averageLevel: number | null;
  averageEmoji: string;
  averageLabel: string;
  category: TagAnalyticsCategory;
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

/**
 * 連続記録ストリーク情報
 */
export interface StreakInfo {
  currentStreak: number; // 現在の連続記録日数
  longestStreak: number; // 最長連続記録日数
  lastRecordedDate: string; // 最終記録日 (YYYY-MM-DD)
  freezeAvailable?: boolean; // 今週のストリークフリーズ（1日救済チケット）所持フラグ
  lastFrozenDate?: string; // 最後にフリーズが適用された日 (YYYY-MM-DD)
}

/**
 * ココロの木（Growth Mind Tree）成長情報
 */
export interface MindTreeInfo {
  level: number; // レベル (1: 種/芽, 2: 若葉, 3: 若木, 4: 大木, 5: 花咲く木)
  xp: number; // 現在の合計XP
  currentLevelXp: number; // 現在のレベル内獲得XP
  nextLevelXp: number; // 次のレベルに必要なXP
  stageName: string; // ステージ名
  emoji: string; // 木の表現絵文字
}

/**
 * 週末振り返りレポートデータ
 */
export interface WeeklyReportData {
  startDate: string; // 週の開始日 (YYYY-MM-DD)
  endDate: string; // 週の終了日 (YYYY-MM-DD)
  recordedDaysCount: number; // 今週の記録日数 (0~7)
  totalEntries: number; // 今週の総エントリ数
  averageLevel: number | null; // 平均感情レベル
  averageEmoji: string; // 平均レベルに対応する絵文字
  topTags: string[]; // よく記録した要因タグ上位
  treeXpGained: number; // 今週獲得したXP
  message: string; // 今週のセルフケア応援メッセージ
}

/**
 * アチーブメントのカテゴリ
 */
export type AchievementCategory = 'streak' | 'total' | 'selfcare' | 'special';

/**
 * アチーブメントバッジ情報
 */
export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string; // 絵文字アイコン (例: 🌱, 🔥, 🏆, 🫁)
  category: AchievementCategory;
  unlockedAt: string | null; // 解放日時 (ISO 8601, 未解放の場合は null)
  targetCount: number; // 達成に必要な目標数
  currentCount: number; // 現在の達成進捗
}

/**
 * ユーザープロフィール情報
 */
export interface UserProfile {
  nickname: string;
  avatarType: 'emoji' | 'image';
  avatarValue: string; // 絵文字(例: '🐱') または 画像URI
  createdAt: string; // ISO 8601
}
