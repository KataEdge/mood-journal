import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLocalDateString,
  calculateStreak,
  getCalendarStreakData,
  getUnlockedBadgesMap,
  saveUnlockedBadgesMap,
  checkAndEvaluateBadges,
  calculateMindTreeInfo,
  getStoredTreeXP,
  addTreeXP,
  getStreakFreezeData,
  calculateStreakWithFreeze,
  getWeeklyReportData,
  INITIAL_BADGES,
} from '../streak';
import { MoodEntry } from '../../types';

describe('streak utility', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('getLocalDateString', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date(2026, 6, 28); // 2026-07-28
      const formatted = getLocalDateString(date);
      expect(formatted).toBe('2026-07-28');
    });
  });

  describe('calculateStreak', () => {
    it('should return 0 streak for empty entries', () => {
      const streak = calculateStreak([]);
      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(0);
      expect(streak.lastRecordedDate).toBe('');
    });

    it('should calculate current streak if recorded today', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const entries: MoodEntry[] = [
        { id: '1', timestamp: today.toISOString(), mood: 5 },
        { id: '2', timestamp: yesterday.toISOString(), mood: 4 },
      ];

      const streak = calculateStreak(entries);
      expect(streak.currentStreak).toBe(2);
      expect(streak.longestStreak).toBe(2);
    });

    it('should calculate current streak if recorded yesterday but not today', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const entries: MoodEntry[] = [
        { id: '1', timestamp: yesterday.toISOString(), mood: 4 },
        { id: '2', timestamp: twoDaysAgo.toISOString(), mood: 3 },
      ];

      const streak = calculateStreak(entries);
      expect(streak.currentStreak).toBe(2);
      expect(streak.longestStreak).toBe(2);
    });

    it('should reset current streak to 0 if missed yesterday and today', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const entries: MoodEntry[] = [{ id: '1', timestamp: threeDaysAgo.toISOString(), mood: 3 }];

      const streak = calculateStreak(entries);
      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(1);
    });

    it('should handle streak gap when calculating longest streak', () => {
      const d1 = new Date();
      d1.setDate(d1.getDate() - 10);
      const d2 = new Date();
      d2.setDate(d2.getDate() - 9);
      const d3 = new Date();
      d3.setDate(d3.getDate() - 5);

      const entries: MoodEntry[] = [
        { id: '1', timestamp: d1.toISOString(), mood: 3 },
        { id: '2', timestamp: d2.toISOString(), mood: 3 },
        { id: '3', timestamp: d3.toISOString(), mood: 3 },
      ];

      const streak = calculateStreak(entries);
      expect(streak.longestStreak).toBe(2);
    });
  });

  describe('getCalendarStreakData', () => {
    it('should return empty map and set for empty entries', () => {
      const result = getCalendarStreakData([]);
      expect(result.dateMoodMap).toEqual({});
      expect(result.streakDates.size).toBe(0);
    });

    it('should map entries by date and identify streak dates', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const entries: MoodEntry[] = [
        { id: '1', timestamp: today.toISOString(), mood: 5 },
        { id: '2', timestamp: yesterday.toISOString(), mood: 4 },
      ];

      const result = getCalendarStreakData(entries);
      const todayStr = getLocalDateString(today);
      const yesterdayStr = getLocalDateString(yesterday);

      expect(result.dateMoodMap[todayStr]).toHaveLength(1);
      expect(result.dateMoodMap[yesterdayStr]).toHaveLength(1);
      expect(result.streakDates.has(todayStr)).toBe(true);
      expect(result.streakDates.has(yesterdayStr)).toBe(true);
    });
  });

  describe('Unlocked Badges Map', () => {
    it('should save and load unlocked badges map', async () => {
      expect(await getUnlockedBadgesMap()).toEqual({});

      const map = { first_step: '2026-07-28T00:00:00.000Z' };
      await saveUnlockedBadgesMap(map);

      expect(await getUnlockedBadgesMap()).toEqual(map);
    });

    it('should handle JSON parse errors gracefully in getUnlockedBadgesMap', async () => {
      await AsyncStorage.setItem('@mood_journal_unlocked_badges', 'invalid_json');
      const map = await getUnlockedBadgesMap();
      expect(map).toEqual({});
    });

    it('should handle error when saveUnlockedBadgesMap fails', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      await expect(saveUnlockedBadgesMap({ first_step: 'now' })).resolves.not.toThrow();
    });
  });

  describe('checkAndEvaluateBadges', () => {
    it('should evaluate badges correctly for first entry', async () => {
      const today = new Date();
      today.setHours(7, 0, 0, 0); // Early bird (5-9 AM)

      const entries: MoodEntry[] = [
        {
          id: '1',
          timestamp: today.toISOString(),
          mood: 5,
          note: 'Great morning',
          tags: ['朝'],
        },
      ];

      const result = await checkAndEvaluateBadges(entries, 1);
      expect(result.badges.length).toBe(INITIAL_BADGES.length);
      expect(result.newlyUnlocked.some((b) => b.id === 'first_step')).toBe(true);
      expect(result.newlyUnlocked.some((b) => b.id === 'early_bird')).toBe(true);
      expect(result.newlyUnlocked.some((b) => b.id === 'selfcare_breathing')).toBe(true);
    });

    it('should evaluate night owl and weekend badges and multiple mood badges', async () => {
      const nightDate = new Date();
      nightDate.setHours(22, 0, 0, 0);

      const entries: MoodEntry[] = [
        { id: '1', timestamp: nightDate.toISOString(), mood: 4, note: 'Night note' },
        { id: '2', timestamp: nightDate.toISOString(), mood: 1, note: 'Low note' },
        { id: '3', timestamp: nightDate.toISOString(), mood: 2, note: 'Note 3' },
        { id: '4', timestamp: nightDate.toISOString(), mood: 3, note: 'Note 4' },
        { id: '5', timestamp: nightDate.toISOString(), mood: 5, note: 'Note 5' },
      ];

      const result = await checkAndEvaluateBadges(entries, 5);
      expect(result.badges.find((b) => b.id === 'night_owl')?.currentCount).toBe(1);
      expect(result.badges.find((b) => b.id === 'all_moods')?.currentCount).toBe(5);
      expect(result.badges.find((b) => b.id === 'writer')?.currentCount).toBe(5);
      expect(result.badges.find((b) => b.id === 'breathing_master')?.currentCount).toBe(5);
    });

    it('should evaluate streak and total count badges correctly', async () => {
      const today = new Date();
      const entries: MoodEntry[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        entries.push({ id: `e-${i}`, timestamp: d.toISOString(), mood: 5, note: 'note' });
      }

      const result = await checkAndEvaluateBadges(entries, 0);
      expect(result.badges.find((b) => b.id === 'streak_3')?.currentCount).toBe(3);
      expect(result.badges.find((b) => b.id === 'streak_7')?.currentCount).toBe(7);
      expect(result.badges.find((b) => b.id === 'streak_14')?.currentCount).toBe(14);
      expect(result.badges.find((b) => b.id === 'streak_30')?.currentCount).toBe(30);
      expect(result.badges.find((b) => b.id === 'total_10')?.currentCount).toBe(10);
    });
  });

  describe('Mind Tree Info', () => {
    it('should calculate mind tree level based on XP', () => {
      const info1 = calculateMindTreeInfo(0);
      expect(info1.level).toBe(1);
      expect(info1.stageName).toBe('芽ばえのココロ');

      const info2 = calculateMindTreeInfo(600);
      expect(info2.level).toBe(5);
      expect(info2.stageName).toBe('まんかいの幸福木');
    });

    it('should get and add tree XP', async () => {
      expect(await getStoredTreeXP()).toBe(0);
      const updated = await addTreeXP(25);
      expect(updated).toBe(25);
      expect(await getStoredTreeXP()).toBe(25);
    });

    it('should handle error in getStoredTreeXP', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      expect(await getStoredTreeXP()).toBe(0);
    });

    it('should handle error in addTreeXP', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      expect(await addTreeXP(10)).toBe(0);
    });
  });

  describe('Streak Freeze', () => {
    it('should get initial streak freeze data', async () => {
      const data = await getStreakFreezeData();
      expect(data.freezeAvailable).toBe(true);
    });

    it('should calculate streak with freeze if yesterday was missed but 2 days ago recorded', async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const entries: MoodEntry[] = [{ id: '1', timestamp: twoDaysAgo.toISOString(), mood: 4 }];

      const streak = await calculateStreakWithFreeze(entries);
      expect(streak.currentStreak).toBe(2);
      expect(streak.freezeAvailable).toBe(false);
    });

    it('should reset freeze data when ISO week changes', async () => {
      const oldFreeze = {
        freezeAvailable: false,
        lastResetWeek: '2020-W01',
        lastFrozenDate: '2020-01-01',
      };
      await AsyncStorage.setItem('@mood_journal_streak_freeze_info', JSON.stringify(oldFreeze));

      const data = await getStreakFreezeData();
      expect(data.freezeAvailable).toBe(true);
    });

    it('should handle error in getStreakFreezeData', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      const data = await getStreakFreezeData();
      expect(data.freezeAvailable).toBe(true);
    });
  });

  describe('getWeeklyReportData', () => {
    it('should generate weekly report with different average mood emoji levels', () => {
      const today = new Date().toISOString();

      // High mood average >= 4.5
      const report1 = getWeeklyReportData([{ id: '1', timestamp: today, mood: 5 }], 100);
      expect(report1.averageEmoji).toBe('😄');

      // Mid-high mood average >= 3.5
      const report2 = getWeeklyReportData([{ id: '1', timestamp: today, mood: 4 }], 100);
      expect(report2.averageEmoji).toBe('🙂');

      // Neutral mood average >= 2.5
      const report3 = getWeeklyReportData([{ id: '1', timestamp: today, mood: 3 }], 100);
      expect(report3.averageEmoji).toBe('😐');

      // Low mood average >= 1.5
      const report4 = getWeeklyReportData([{ id: '1', timestamp: today, mood: 2 }], 100);
      expect(report4.averageEmoji).toBe('🙁');

      // Very low mood average < 1.5
      const report5 = getWeeklyReportData([{ id: '1', timestamp: today, mood: 1 }], 100);
      expect(report5.averageEmoji).toBe('😢');
    });

    it('should generate weekly report message based on recordedDaysCount', () => {
      const today = new Date();
      const entries: MoodEntry[] = [];
      for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        entries.push({ id: `${i}`, timestamp: d.toISOString(), mood: 4 });
      }

      const report5Days = getWeeklyReportData(entries, 50);
      expect(report5Days.message).toContain('素晴らしい継続力');

      const report3Days = getWeeklyReportData(entries.slice(0, 3), 30);
      expect(report3Days.message).toContain('マイペースに記録');

      const report1Day = getWeeklyReportData(entries.slice(0, 1), 10);
      expect(report1Day.message).toContain('忙しい中でも記録');

      const report0Days = getWeeklyReportData([], 0);
      expect(report0Days.message).toContain('今週もお疲れ様でした');
    });
  });
});
