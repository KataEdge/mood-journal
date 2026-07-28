import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  isHealthKitSupported,
  getMockHealthData,
  requestHealthPermissions,
  fetchTodayHealthData,
  getHealthSyncPreference,
  setHealthSyncPreference,
} from '../health';

const mockAppleHealthKit = {
  isAvailable: jest.fn().mockImplementation((cb) => cb && cb(null, true)),
  initHealthKit: jest.fn().mockImplementation((opts, cb) => cb && cb(null)),
  getSleepSamples: jest.fn().mockImplementation((opts, cb) =>
    cb(null, [
      {
        value: 'INBED',
        startDate: '2026-07-28T00:00:00.000Z',
        endDate: '2026-07-28T07:30:00.000Z',
      },
    ])
  ),
  getAppleExerciseTime: jest.fn().mockImplementation((opts, cb) => cb(null, [{ value: 30 }])),
  getActiveEnergyBurned: jest.fn().mockImplementation((opts, cb) => cb(null, [{ value: 250 }])),
  getStepCount: jest.fn().mockImplementation((opts, cb) => cb(null, { value: 8000 })),
  Constants: {
    Permissions: {
      SleepAnalysis: 'SleepAnalysis',
      ActiveEnergyBurned: 'ActiveEnergyBurned',
      AppleExerciseTime: 'AppleExerciseTime',
      StepCount: 'StepCount',
    },
  },
};

jest.mock('react-native-health', () => ({
  __esModule: true,
  default: mockAppleHealthKit,
}));

describe('health utility', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = 'ios';
  });

  describe('isHealthKitSupported', () => {
    it('should return true when Platform.OS is ios and AppleHealthKit is available', () => {
      expect(isHealthKitSupported()).toBe(true);
    });

    it('should return false when Platform.OS is android or web', () => {
      (Platform as { OS: string }).OS = 'android';
      expect(isHealthKitSupported()).toBe(false);

      (Platform as { OS: string }).OS = 'web';
      expect(isHealthKitSupported()).toBe(false);
    });
  });

  describe('getMockHealthData', () => {
    it('should generate valid mock health data object', () => {
      const data = getMockHealthData();
      expect(data).toHaveProperty('sleepHours');
      expect(data).toHaveProperty('workoutMinutes');
      expect(data).toHaveProperty('activeCalories');
      expect(data).toHaveProperty('stepCount');
      expect(data).toHaveProperty('syncedAt');
    });
  });

  describe('requestHealthPermissions', () => {
    it('should resolve true when initHealthKit succeeds', async () => {
      const granted = await requestHealthPermissions();
      expect(granted).toBe(true);
    });

    it('should resolve false when Platform.OS is not ios', async () => {
      (Platform as { OS: string }).OS = 'android';
      const granted = await requestHealthPermissions();
      expect(granted).toBe(false);
    });

    it('should resolve false when initHealthKit returns error', async () => {
      mockAppleHealthKit.initHealthKit.mockImplementationOnce(
        (opts: unknown, cb: (err: string) => void) => cb('Permission denied')
      );
      const granted = await requestHealthPermissions();
      expect(granted).toBe(false);
    });
  });

  describe('fetchTodayHealthData', () => {
    it('should fetch real yesterday HealthKit data when available on iOS', async () => {
      const result = await fetchTodayHealthData();
      expect(result.isMock).toBe(false);
      expect(result.data).not.toBeNull();
      expect(result.data?.sleepHours).toBe(7.5);
      expect(result.data?.workoutMinutes).toBe(30);
      expect(result.data?.activeCalories).toBe(250);
      expect(result.data?.stepCount).toBe(8000);
    });

    it('should return null data when all HealthKit values are zero', async () => {
      mockAppleHealthKit.getSleepSamples.mockImplementationOnce(
        (opts: unknown, cb: (err: null, val: []) => void) => cb(null, [])
      );
      mockAppleHealthKit.getAppleExerciseTime.mockImplementationOnce(
        (opts: unknown, cb: (err: null, val: []) => void) => cb(null, [])
      );
      mockAppleHealthKit.getActiveEnergyBurned.mockImplementationOnce(
        (opts: unknown, cb: (err: null, val: []) => void) => cb(null, [])
      );
      mockAppleHealthKit.getStepCount.mockImplementationOnce(
        (opts: unknown, cb: (err: null, val: { value: 0 }) => void) => cb(null, { value: 0 })
      );

      const result = await fetchTodayHealthData();
      expect(result.isMock).toBe(false);
      expect(result.data).toBeNull();
    });

    it('should return null data when error occurs in fetchYesterdayHealthKitData', async () => {
      mockAppleHealthKit.getSleepSamples.mockImplementationOnce(() => {
        throw new Error('HealthKit fetch error');
      });

      const result = await fetchTodayHealthData();
      expect(result.isMock).toBe(false);
      expect(result.data).toBeNull();
    });

    it('should return mock data when Platform.OS is not ios', async () => {
      (Platform as { OS: string }).OS = 'android';
      const result = await fetchTodayHealthData();
      expect(result.isMock).toBe(true);
      expect(result.data).not.toBeNull();
    });
  });

  describe('Health Sync Preference', () => {
    it('should default to false when preference is unassigned', async () => {
      expect(await getHealthSyncPreference()).toBe(false);
    });

    it('should save and load health sync preference', async () => {
      await setHealthSyncPreference(true);
      expect(await getHealthSyncPreference()).toBe(true);

      await setHealthSyncPreference(false);
      expect(await getHealthSyncPreference()).toBe(false);
    });

    it('should handle error in getHealthSyncPreference', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      expect(await getHealthSyncPreference()).toBe(false);
    });

    it('should handle error in setHealthSyncPreference', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      await expect(setHealthSyncPreference(true)).resolves.not.toThrow();
    });
  });
});
