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



