import { MoodOption, ThemeType } from '../types';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  accent: string;
  accentDark: string;

  background: string;
  surface: string;
  surfaceElevated: string;

  textPrimary: string;
  textSecondary: string;
  textLight: string;
  textOnPrimary: string;

  border: string;
  divider: string;

  success: string;
  warning: string;
  error: string;

  mood1: string;
  mood2: string;
  mood3: string;
  mood4: string;
  mood5: string;

  tagBg: string;
  tagSelectedBg: string;
  tagText: string;
  tagSelectedText: string;

  shadow: string;
  statusBar: 'light' | 'dark';
}

/**
 * ノーマル（ライト）テーマ
 */
export const LightThemeColors: ThemeColors = {
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

  mood1: '#FFD93D',
  mood2: '#6BCB77',
  mood3: '#A8D8EA',
  mood4: '#AA96DA',
  mood5: '#FF8B94',

  tagBg: '#EDF2F7',
  tagSelectedBg: '#AA96DA',
  tagText: '#4A5568',
  tagSelectedText: '#FFFFFF',

  shadow: '#000000',
  statusBar: 'dark',
};

/**
 * ダークテーマ
 */
export const DarkThemeColors: ThemeColors = {
  primary: '#5B9BD5',
  primaryDark: '#41729F',
  secondary: '#887BB0',
  secondaryDark: '#6A5C93',
  accent: '#D689A0',
  accentDark: '#B3687F',

  background: '#121418',
  surface: '#1E222A',
  surfaceElevated: '#282C37',

  textPrimary: '#F0F2F5',
  textSecondary: '#A0AAB8',
  textLight: '#606875',
  textOnPrimary: '#FFFFFF',

  border: '#2C3240',
  divider: '#252A36',

  success: '#5BB98B',
  warning: '#E6A15C',
  error: '#E06C75',

  mood1: '#F1C40F',
  mood2: '#2ECC71',
  mood3: '#3498DB',
  mood4: '#9B59B6',
  mood5: '#E74C3C',

  tagBg: '#2A303C',
  tagSelectedBg: '#887BB0',
  tagText: '#C0C8D4',
  tagSelectedText: '#FFFFFF',

  shadow: '#000000',
  statusBar: 'light',
};

/**
 * ウォーム（アンバー・テラコッタ調）テーマ
 */
export const WarmThemeColors: ThemeColors = {
  primary: '#F4A261',
  primaryDark: '#E76F51',
  secondary: '#E9C46A',
  secondaryDark: '#D4A373',
  accent: '#F28482',
  accentDark: '#E56B6F',

  background: '#FAF6F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFDF9',

  textPrimary: '#3D2C2E',
  textSecondary: '#7A6567',
  textLight: '#B8A6A8',
  textOnPrimary: '#FFFFFF',

  border: '#F0E6DD',
  divider: '#F7EFE8',

  success: '#81B29A',
  warning: '#F4A261',
  error: '#E07A5F',

  mood1: '#E9C46A',
  mood2: '#81B29A',
  mood3: '#F4A261',
  mood4: '#D4A373',
  mood5: '#E07A5F',

  tagBg: '#F5EBE6',
  tagSelectedBg: '#E76F51',
  tagText: '#665355',
  tagSelectedText: '#FFFFFF',

  shadow: '#3D2C2E',
  statusBar: 'dark',
};

/**
 * テーマ名に応じた ThemeColors を取得
 */
export const getThemeColors = (theme: ThemeType): ThemeColors => {
  switch (theme) {
    case 'dark':
      return DarkThemeColors;
    case 'warm':
      return WarmThemeColors;
    case 'light':
    default:
      return LightThemeColors;
  }
};

/**
 * 互換性のためのデフォルト Colors
 */
export const Colors = LightThemeColors;


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
