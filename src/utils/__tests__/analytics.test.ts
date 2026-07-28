import { formatDateKey, calculateAnalyticsSummary } from '../analytics';
import { MoodEntry } from '../../types';

describe('analytics utility', () => {
  describe('formatDateKey', () => {
    it('should format ISO timestamp to YYYY-MM-DD string', () => {
      const formatted = formatDateKey('2026-07-28T04:00:00.000Z');
      const expected = new Date('2026-07-28T04:00:00.000Z');
      const year = expected.getFullYear();
      const month = String(expected.getMonth() + 1).padStart(2, '0');
      const day = String(expected.getDate()).padStart(2, '0');

      expect(formatted).toBe(`${year}-${month}-${day}`);
    });
  });

  describe('calculateAnalyticsSummary', () => {
    it('should return default summary when entries array is empty', () => {
      const summary = calculateAnalyticsSummary([], '7days');

      expect(summary.totalCount).toBe(0);
      expect(summary.averageLevel).toBeNull();
      expect(summary.averageLabel).toBe('記録なし');
      expect(summary.chartPoints).toHaveLength(7);
      expect(summary.distribution).toHaveLength(5);
      expect(summary.tagAnalytics).toHaveLength(0);
      expect(summary.adviceMessage).toContain('まだこの期間の記録がありません');
    });

    it('should calculate analytics summary for 7days with valid entries', () => {
      const today = new Date().toISOString();
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      const entries: MoodEntry[] = [
        {
          id: '1',
          timestamp: today,
          mood: 5,
          tags: ['仕事', '運動'],
        },
        {
          id: '2',
          timestamp: yesterday,
          mood: 4,
          tags: ['仕事'],
        },
      ];

      const summary = calculateAnalyticsSummary(entries, '7days');

      expect(summary.totalCount).toBe(2);
      expect(summary.averageLevel).toBe(4.5);
      expect(summary.averageEmoji).toBe('😄');
      expect(summary.adviceMessage).toContain('素晴らしい期間でしたね');
      expect(summary.tagAnalytics).toHaveLength(2);

      const jobTag = summary.tagAnalytics.find((t) => t.tagName === '仕事');
      expect(jobTag?.count).toBe(2);
      expect(jobTag?.averageLevel).toBe(4.5);
      expect(jobTag?.category).toBe('positive');
    });

    it('should calculate analytics summary for 30days', () => {
      const today = new Date().toISOString();
      const entries: MoodEntry[] = [
        {
          id: '1',
          timestamp: today,
          mood: 4,
        },
      ];

      const summary = calculateAnalyticsSummary(entries, '30days');

      expect(summary.chartPoints).toHaveLength(30);
      expect(summary.totalCount).toBe(1);
      expect(summary.averageLevel).toBe(4);
      expect(summary.adviceMessage).toContain('とても良いペースで過ごせています');
    });

    it('should provide appropriate advice messages for different average levels', () => {
      const today = new Date().toISOString();

      // Level 5 (avg >= 4.2)
      const topEntries: MoodEntry[] = [{ id: '1', timestamp: today, mood: 5 }];
      expect(calculateAnalyticsSummary(topEntries, '7days').adviceMessage).toContain(
        '素晴らしい期間でしたね'
      );

      // Level 4 (3.2 <= avg < 4.2)
      const highEntries: MoodEntry[] = [{ id: '1', timestamp: today, mood: 4 }];
      expect(calculateAnalyticsSummary(highEntries, '7days').adviceMessage).toContain(
        'とても良いペースで過ごせています'
      );

      // Level 3 (2.2 <= avg < 3.2)
      const midEntries: MoodEntry[] = [{ id: '1', timestamp: today, mood: 3 }];
      expect(calculateAnalyticsSummary(midEntries, '7days').adviceMessage).toContain(
        '安定した日々が続いています'
      );

      // Level 2 (avg < 2.2)
      const lowEntries: MoodEntry[] = [{ id: '1', timestamp: today, mood: 2 }];
      expect(calculateAnalyticsSummary(lowEntries, '7days').adviceMessage).toContain(
        '少しお疲れ気味かもしれません'
      );
    });

    it('should calculate tag categories correctly and sort by count and average level', () => {
      const today = new Date().toISOString();
      const entries: MoodEntry[] = [
        { id: '1', timestamp: today, mood: 5, tags: ['趣味'] },
        { id: '2', timestamp: today, mood: 2, tags: ['残業'] },
        { id: '3', timestamp: today, mood: 3, tags: ['家事'] },
      ];

      const summary = calculateAnalyticsSummary(entries, '7days');
      expect(summary.tagAnalytics[0].tagName).toBe('趣味'); // avg 5
      const overtimeTag = summary.tagAnalytics.find((t) => t.tagName === '残業');
      expect(overtimeTag?.category).toBe('negative');

      const houseworkTag = summary.tagAnalytics.find((t) => t.tagName === '家事');
      expect(houseworkTag?.category).toBe('neutral');
    });
  });
});
