import { MoodOption } from '../types';

/**
 * アプリ全体のカラーパレット
 * パステルカラーを基調とした柔らかい配色
 */
export const Colors = {
  primary: '#A8D8EA',
  primaryDark: '#7EC8D9',
  secondary: '#AA96DA',
  secondaryDark: '#9280C8',
  accent: '#FCBAD3',
  accentDark: '#F5A0BF',

  background: '#F8F9FE',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  textOnPrimary: '#FFFFFF',

  border: '#E8EDF2',
  divider: '#F0F3F8',

  success: '#A8E6CF',
  warning: '#FFD3B6',
  error: '#FF8B94',

  mood1: '#FFD93D', // とても良い - 明るい黄色
  mood2: '#6BCB77', // 良い - グリーン
  mood3: '#A8D8EA', // 普通 - ペールブルー
  mood4: '#AA96DA', // 悪い - ラベンダー
  mood5: '#FF8B94', // とても悪い - ソフトピンク

  tagBg: '#EDF2F7',
  tagSelectedBg: '#AA96DA',
  tagText: '#4A5568',
  tagSelectedText: '#FFFFFF',

  shadow: '#000000',
} as const;

/**
 * フォントサイズ
 */
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
} as const;

/**
 * スペーシング
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * 角丸
 */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

/**
 * シャドウスタイル
 */
export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

/**
 * 気分の選択肢
 */
export const MOOD_OPTIONS: MoodOption[] = [
  { level: 1, emoji: '😄', label: 'とても良い', color: Colors.mood1 },
  { level: 2, emoji: '🙂', label: '良い', color: Colors.mood2 },
  { level: 3, emoji: '😐', label: '普通', color: Colors.mood3 },
  { level: 4, emoji: '😔', label: '少し辛い', color: Colors.mood4 },
  { level: 5, emoji: '😢', label: '辛い', color: Colors.mood5 },
];

/**
 * デフォルトの感情要因プリセットタグ
 */
export const DEFAULT_PRESET_TAGS: string[] = [
  '仕事・勉強',
  '人間関係',
  '健康・体調',
  '趣味・娯楽',
  '睡眠',
  '家族',
  '金銭・買物',
  '移動・旅行',
];
