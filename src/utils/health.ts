import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthData } from '../types';

const HEALTH_SYNC_ENABLED_KEY = 'mood_journal_health_sync_enabled';

/**
 * ヘルスケア連携がサポートされている環境か判定
 */
export const isHealthKitSupported = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * デモ・Web・フォールバック用モックヘルスケアデータ生成
 */
export const getMockHealthData = (): HealthData => {
  // 時間帯に応じた現実的な擬似データを生成
  const now = new Date();
  const dateSeed = now.getDate() + now.getHours();

  const mockSleepHours = Number((6.5 + (dateSeed % 3) * 0.6).toFixed(1)); // 6.5h 〜 7.7h
  const mockWorkoutMinutes = ((dateSeed * 15) % 60) + 15; // 15m 〜 60m
  const mockActiveCalories = mockWorkoutMinutes * 6 + 40; // 130kcal 〜 400kcal

  return {
    sleepHours: mockSleepHours,
    workoutMinutes: mockWorkoutMinutes,
    activeCalories: mockActiveCalories,
    syncedAt: now.toISOString(),
  };
};

/**
 * 今日のヘルスケアデータを取得する
 * iOS Native環境では実機HealthKitの代替サービス、Web/未許可時はモックデータを返却
 */
export const fetchTodayHealthData = async (): Promise<HealthData> => {
  try {
    if (!isHealthKitSupported()) {
      // Webブラウザ・Android等はスムーズにモックデータを返却
      return getMockHealthData();
    }

    // iOS実機/シミュレータ時の擬似同期処理（実機ライブラリ未ロード時も安全）
    await new Promise((resolve) => setTimeout(resolve, 400));
    return getMockHealthData();
  } catch (error) {
    console.warn('ヘルスケアデータの取得に失敗しました。モックデータを使用します。', error);
    return getMockHealthData();
  }
};

/**
 * ヘルスケア同期トグルの有効/無効設定を読み込み
 */
export const getHealthSyncPreference = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(HEALTH_SYNC_ENABLED_KEY);
    return value !== null ? JSON.parse(value) : true; // デフォルトはON
  } catch (error) {
    console.error('ヘルスケア設定の読み込みエラー:', error);
    return true;
  }
};

/**
 * ヘルスケア同期トグルの有効/無効設定を保存
 */
export const setHealthSyncPreference = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(HEALTH_SYNC_ENABLED_KEY, JSON.stringify(enabled));
  } catch (error) {
    console.error('ヘルスケア設定の保存エラー:', error);
  }
};
