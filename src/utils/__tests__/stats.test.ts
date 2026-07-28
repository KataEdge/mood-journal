import { calculateStats, calculateHealthStats } from '../stats';
import { MoodEntry, HealthData } from '../../types';

describe('stats utility', () => {
  const sampleEntries: MoodEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      mood: 5,
      note: 'Great day',
      tags: ['仕事'],
      healthData: {
        sleepHours: 8,
        workoutMinutes: 30,
        activeCalories: 200,
        stepCount: 8000,
        syncedAt: new Date().toISOString(),
      },
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      mood: 4,
      note: 'Good day',
      healthData: {
        sleepHours: 7,
        workoutMinutes: 20,
        activeCalories: 150,
        stepCount: 6000,
        syncedAt: new Date().toISOString(),
      },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      mood: 2,
      note: 'Tough day',
    },
  ];

  describe('calculateStats', () => {
    it('should return empty stats for empty entries', () => {
      const stats = calculateStats([]);
      expect(stats.totalCount).toBe(0);
      expect(stats.averageMood).toBeNull();
      expect(stats.representativeEmoji).toBe('✨');
      expect(stats.dailyPoints).toHaveLength(7);
      expect(stats.distribution).toHaveLength(5);
    });

    it('should calculate correct average mood and representative emoji with default days parameter', () => {
      const stats = calculateStats(sampleEntries);
      expect(stats.totalCount).toBe(3);
      expect(stats.averageMood).toBe(3.7);
      expect(stats.representativeEmoji).toBe('🙂');
    });

    it('should handle 30 days period', () => {
      const stats = calculateStats(sampleEntries, 30);
      expect(stats.dailyPoints).toHaveLength(30);
    });
  });

  describe('calculateHealthStats', () => {
    it('should return empty health stats when no health data exists', () => {
      const stats = calculateHealthStats([
        { id: '1', timestamp: new Date().toISOString(), mood: 3 },
      ]);
      expect(stats.hasDataCount).toBe(0);
      expect(stats.averageSleepHours).toBeNull();
      expect(stats.averageWorkoutMinutes).toBeNull();
      expect(stats.totalActiveCalories).toBe(0);
      expect(stats.averageStepCount).toBeNull();
      expect(stats.goodMoodSleepHours).toBeNull();
    });

    it('should correctly calculate health averages including goodMoodSleepHours', () => {
      const stats = calculateHealthStats(sampleEntries);
      expect(stats.hasDataCount).toBe(2);
      expect(stats.averageSleepHours).toBe(7.5);
      expect(stats.averageWorkoutMinutes).toBe(25);
      expect(stats.totalActiveCalories).toBe(350);
      expect(stats.averageStepCount).toBe(7000);
      expect(stats.goodMoodSleepHours).toBe(7.5);
    });

    it('should calculate health stats when health entries do not have good mood entries or have missing fields', () => {
      const entries: MoodEntry[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          mood: 2,
          healthData: {} as unknown as HealthData,
        },
      ];

      const stats = calculateHealthStats(entries);
      expect(stats.hasDataCount).toBe(1);
      expect(stats.averageSleepHours).toBe(0);
      expect(stats.averageWorkoutMinutes).toBe(0);
      expect(stats.totalActiveCalories).toBe(0);
      expect(stats.averageStepCount).toBe(0);
      expect(stats.goodMoodSleepHours).toBeNull();
    });
  });
});
