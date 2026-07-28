import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, ThemeType, MoodLevel } from '../types';

const STORAGE_KEY = '@mood_journal_entries';
const FIRST_LAUNCH_KEY = '@mood_journal_first_launch';
const THEME_KEY = '@mood_journal_theme';
const MIGRATED_KEY = '@mood_journal_v2_migrated';

/**
 * 保存されたカラーテーマを取得する
 */
export async function getStoredTheme(): Promise<ThemeType> {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    if (value === 'light' || value === 'dark' || value === 'warm') {
      return value;
    }
    return 'light';
  } catch (error) {
    console.error('Failed to get stored theme:', error);
    return 'light';
  }
}

/**
 * カラーテーマを保存する
 */
export async function saveStoredTheme(theme: ThemeType): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Failed to save stored theme:', error);
  }
}


/**
 * 気分エントリを保存する
 */
export async function saveMoodEntry(entry: MoodEntry): Promise<void> {
  try {
    const existing = await getMoodEntries();
    const updated = [entry, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save mood entry:', error);
    throw error;
  }
}

/**
 * 全ての気分エントリを取得する（新しい順）
 */
export async function getMoodEntries(): Promise<MoodEntry[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    let entries: MoodEntry[] = JSON.parse(json);

    // バージョン2(MoodLevel反転: 5=とても良い, 1=辛い)マイグレーション
    const isMigrated = await AsyncStorage.getItem(MIGRATED_KEY);
    if (!isMigrated) {
      entries = entries.map((entry) => ({
        ...entry,
        mood: (6 - entry.mood) as MoodLevel,
      }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      await AsyncStorage.setItem(MIGRATED_KEY, 'true');
    }

    return entries.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Failed to get mood entries:', error);
    return [];
  }
}

/**
 * 指定したIDの気分エントリを削除する
 */
export async function deleteMoodEntry(id: string): Promise<void> {
  try {
    const entries = await getMoodEntries();
    const filtered = entries.filter((e) => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete mood entry:', error);
    throw error;
  }
}

/**
 * 初回起動かどうかを判定する
 */
export async function isFirstLaunch(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    return value === null;
  } catch (error) {
    console.error('Failed to check first launch:', error);
    return true;
  }
}

/**
 * 初回起動フラグを設定する
 */
export async function setFirstLaunchDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'done');
  } catch (error) {
    console.error('Failed to set first launch flag:', error);
  }
}

const CUSTOM_TAGS_KEY = '@mood_journal_custom_tags';
import { DEFAULT_PRESET_TAGS } from '../constants/theme';

/**
 * 全ての感情タグ（プリセット＋カスタム）を取得する
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(CUSTOM_TAGS_KEY);
    const customTags: string[] = json ? JSON.parse(json) : [];
    // プリセットと重複しないカスタムタグを結合
    const combined = [...DEFAULT_PRESET_TAGS];
    for (const tag of customTags) {
      if (!combined.includes(tag)) {
        combined.push(tag);
      }
    }
    return combined;
  } catch (error) {
    console.error('Failed to get tags:', error);
    return [...DEFAULT_PRESET_TAGS];
  }
}

/**
 * 新しいカスタムタグを追加する
 */
export async function addCustomTag(tagName: string): Promise<string[]> {
  try {
    const trimmed = tagName.trim();
    if (!trimmed) return await getAllTags();

    const json = await AsyncStorage.getItem(CUSTOM_TAGS_KEY);
    const customTags: string[] = json ? JSON.parse(json) : [];

    if (!DEFAULT_PRESET_TAGS.includes(trimmed) && !customTags.includes(trimmed)) {
      const updated = [...customTags, trimmed];
      await AsyncStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(updated));
    }
    return await getAllTags();
  } catch (error) {
    console.error('Failed to add custom tag:', error);
    throw error;
  }
}

/**
 * カスタムタグを削除する
 */
export async function deleteCustomTag(tagName: string): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(CUSTOM_TAGS_KEY);
    const customTags: string[] = json ? JSON.parse(json) : [];
    const filtered = customTags.filter((t) => t !== tagName);
    await AsyncStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(filtered));
    return await getAllTags();
  } catch (error) {
    console.error('Failed to delete custom tag:', error);
    throw error;
  }
}
