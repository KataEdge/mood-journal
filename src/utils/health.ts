import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthData } from '../types';

const HEALTH_SYNC_ENABLED_KEY = 'mood_journal_health_sync_enabled';

export type HealthKitStatus = 'available' | 'unavailable' | 'denied' | 'notDetermined';

/**
 * 安全に react-native-health モジュールを取得する
 */
const getAppleHealthKitModule = () => {
  if (Platform.OS !== 'ios') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AppleHealthKit = require('react-native-health').default;
    return AppleHealthKit;
  } catch (e) {
    console.log('react-native-health モジュールが利用できません（Expo Go 等の環境）');
    return null;
  }
};

/**
 * ヘルスケア連携がサポートされている環境か判定
 */
export const isHealthKitSupported = (): boolean => {
  if (Platform.OS !== 'ios') return false;
  const AppleHealthKit = getAppleHealthKitModule();
  return AppleHealthKit !== null && typeof AppleHealthKit.isAvailable === 'function';
};

/**
 * デモ・Web・フォールバック用モックヘルスケアデータ生成
 */
export const getMockHealthData = (): HealthData => {
  const now = new Date();
  const dateSeed = now.getDate() + now.getHours();

  const mockSleepHours = Number((6.5 + (dateSeed % 3) * 0.6).toFixed(1)); // 6.5h 〜 7.7h
  const mockWorkoutMinutes = ((dateSeed * 15) % 60) + 15; // 15m 〜 60m
  const mockActiveCalories = mockWorkoutMinutes * 6 + 40; // 130kcal 〜 400kcal
  const mockStepCount = 4500 + ((dateSeed * 350) % 6000); // 4500 〜 10500歩

  return {
    sleepHours: mockSleepHours,
    workoutMinutes: mockWorkoutMinutes,
    activeCalories: mockActiveCalories,
    stepCount: mockStepCount,
    syncedAt: now.toISOString(),
  };
};

/**
 * HealthKit 権限設定オブジェクト
 */
const getHealthKitPermissions = () => {
  const AppleHealthKit = getAppleHealthKitModule();
  if (!AppleHealthKit) return null;

  return {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.SleepAnalysis,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        AppleHealthKit.Constants.Permissions.AppleExerciseTime,
        AppleHealthKit.Constants.Permissions.StepCount,
      ],
      write: [],
    },
  };
};

/**
 * HealthKitの権限リクエストおよび初期化
 */
export const requestHealthPermissions = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const AppleHealthKit = getAppleHealthKitModule();
    const permissions = getHealthKitPermissions();

    if (!AppleHealthKit || !permissions) {
      resolve(false);
      return;
    }

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.warn('HealthKit 初期化/権限リクエストエラー:', error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * 前日（昨日 0:00 〜 23:59）の HealthKit データを取得する
 */
const fetchYesterdayHealthKitData = async (): Promise<HealthData | null> => {
  const AppleHealthKit = getAppleHealthKitModule();
  if (!AppleHealthKit) return null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const startOfDay = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
    0,
    0,
    0
  );
  const endOfDay = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
    23,
    59,
    59
  );

  const options = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  try {
    // 各データを非同期に並行取得
    const [sleepHours, workoutMinutes, activeCalories, stepCount] = await Promise.all([
      // 1. 睡眠時間 (時間)
      new Promise<number>((resolve) => {
        AppleHealthKit.getSleepSamples(
          options,
          (err: unknown, results: Array<{ value: string; startDate: string; endDate: string }>) => {
            if (err || !results || results.length === 0) {
              resolve(0);
              return;
            }
            // SleepAnalysis の時間の合計（時間単位）を算出
            const totalMs = results.reduce((sum, sample) => {
              const start = new Date(sample.startDate).getTime();
              const end = new Date(sample.endDate).getTime();
              return sum + Math.max(0, end - start);
            }, 0);
            const hours = Number((totalMs / (1000 * 60 * 60)).toFixed(1));
            resolve(hours);
          }
        );
      }),

      // 2. 運動時間 (分)
      new Promise<number>((resolve) => {
        AppleHealthKit.getAppleExerciseTime(
          options,
          (err: unknown, results: Array<{ value: number }>) => {
            if (err || !results || results.length === 0) {
              resolve(0);
              return;
            }
            const totalMins = results.reduce((sum, r) => sum + (r.value || 0), 0);
            resolve(Math.round(totalMins));
          }
        );
      }),

      // 3. アクティブカロリー (kcal)
      new Promise<number>((resolve) => {
        AppleHealthKit.getActiveEnergyBurned(
          options,
          (err: unknown, results: Array<{ value: number }>) => {
            if (err || !results || results.length === 0) {
              resolve(0);
              return;
            }
            const totalKcal = results.reduce((sum, r) => sum + (r.value || 0), 0);
            resolve(Math.round(totalKcal));
          }
        );
      }),

      // 4. 歩数
      new Promise<number>((resolve) => {
        AppleHealthKit.getStepCount(options, (err: unknown, results: { value: number }) => {
          if (err || !results) {
            resolve(0);
            return;
          }
          resolve(Math.round(results.value || 0));
        });
      }),
    ]);

    // 全ての数値が0の場合は「前日データ未検出」として null を返却
    if (sleepHours === 0 && workoutMinutes === 0 && activeCalories === 0 && stepCount === 0) {
      return null;
    }

    return {
      sleepHours,
      workoutMinutes,
      activeCalories,
      stepCount,
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('HealthKit データ取得エラー:', error);
    return null;
  }
};

/**
 * 今日のヘルスケアデータを取得する
 * iOS Native環境（HealthKit利用可能時）では実データ、それ以外（Web/Expo Go）はモックデータを返却
 */
export const fetchTodayHealthData = async (): Promise<{
  data: HealthData | null;
  isMock: boolean;
}> => {
  try {
    if (!isHealthKitSupported()) {
      return { data: getMockHealthData(), isMock: true };
    }

    const realData = await fetchYesterdayHealthKitData();
    if (realData) {
      return { data: realData, isMock: false };
    }

    // iOS実機でデータが見つからなかった場合
    return { data: null, isMock: false };
  } catch (error) {
    console.warn('ヘルスケアデータの取得に失敗しました。モックデータを使用します。', error);
    return { data: getMockHealthData(), isMock: true };
  }
};

/**
 * ヘルスケア同期トグルの有効/無効設定を読み込み
 */
export const getHealthSyncPreference = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(HEALTH_SYNC_ENABLED_KEY);
    return value !== null ? JSON.parse(value) : false; // デフォルトはOFF（明示的な連携開始を促すため）
  } catch (error) {
    console.error('ヘルスケア設定の読み込みエラー:', error);
    return false;
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
