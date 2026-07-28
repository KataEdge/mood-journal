import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types';

const STORAGE_KEY = '@mood_journal_entries';
const FIRST_LAUNCH_KEY = '@mood_journal_first_launch';

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
    const entries: MoodEntry[] = JSON.parse(json);
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
