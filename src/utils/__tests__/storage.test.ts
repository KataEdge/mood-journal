import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getStoredTheme,
  saveStoredTheme,
  saveMoodEntry,
  getMoodEntries,
  deleteMoodEntry,
  isFirstLaunch,
  setFirstLaunchDone,
  getAllTags,
  addCustomTag,
  deleteCustomTag,
  getUserProfile,
  saveUserProfile,
} from '../storage';
import { MoodEntry, UserProfile } from '../../types';
import { DEFAULT_PRESET_TAGS } from '../../constants/theme';

describe('storage utility', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('Theme Storage', () => {
    it('should default to light theme if unassigned or invalid', async () => {
      expect(await getStoredTheme()).toBe('light');

      await AsyncStorage.setItem('@mood_journal_theme', 'invalid');
      expect(await getStoredTheme()).toBe('light');
    });

    it('should save and retrieve valid themes', async () => {
      await saveStoredTheme('dark');
      expect(await getStoredTheme()).toBe('dark');

      await saveStoredTheme('warm');
      expect(await getStoredTheme()).toBe('warm');
    });

    it('should handle error when getting theme fails', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      const theme = await getStoredTheme();
      expect(theme).toBe('light');
    });

    it('should handle error when saving theme fails', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      await expect(saveStoredTheme('dark')).resolves.not.toThrow();
    });
  });

  describe('Mood Entries Storage', () => {
    const entry1: MoodEntry = {
      id: 'entry-1',
      timestamp: '2026-07-28T10:00:00.000Z',
      mood: 5,
      note: 'Note 1',
    };

    const entry2: MoodEntry = {
      id: 'entry-2',
      timestamp: '2026-07-28T12:00:00.000Z',
      mood: 4,
      note: 'Note 2',
    };

    it('should save and get mood entries in descending timestamp order', async () => {
      await AsyncStorage.setItem('@mood_journal_v2_migrated', 'true');
      await saveMoodEntry(entry1);
      await saveMoodEntry(entry2);

      const entries = await getMoodEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0].id).toBe('entry-2');
      expect(entries[1].id).toBe('entry-1');
    });

    it('should update existing entry when saving with same ID', async () => {
      await AsyncStorage.setItem('@mood_journal_v2_migrated', 'true');
      await saveMoodEntry(entry1);

      const updatedEntry = { ...entry1, note: 'Updated Note' };
      await saveMoodEntry(updatedEntry);

      const entries = await getMoodEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].note).toBe('Updated Note');
    });

    it('should delete entry by ID', async () => {
      await AsyncStorage.setItem('@mood_journal_v2_migrated', 'true');
      await saveMoodEntry(entry1);
      await saveMoodEntry(entry2);

      await deleteMoodEntry('entry-1');

      const entries = await getMoodEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('entry-2');
    });

    it('should perform v2 mood level migration if not migrated', async () => {
      const v1Entry = {
        id: 'v1-1',
        timestamp: '2026-07-28T10:00:00.000Z',
        mood: 1, // In v1: 1 was best, so in v2: (6 - 1) = 5
      };
      await AsyncStorage.setItem('@mood_journal_entries', JSON.stringify([v1Entry]));

      const entries = await getMoodEntries();
      expect(entries[0].mood).toBe(5);
      expect(await AsyncStorage.getItem('@mood_journal_v2_migrated')).toBe('true');
    });

    it('should handle error in getMoodEntries', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      const entries = await getMoodEntries();
      expect(entries).toEqual([]);
    });

    it('should handle error in saveMoodEntry', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      await expect(saveMoodEntry(entry1)).rejects.toThrow('Storage error');
    });

    it('should handle error in deleteMoodEntry', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      await expect(deleteMoodEntry('entry-1')).rejects.toThrow('Storage error');
    });
  });

  describe('First Launch Storage', () => {
    it('should check isFirstLaunch and setFirstLaunchDone', async () => {
      expect(await isFirstLaunch()).toBe(true);

      await setFirstLaunchDone();

      expect(await isFirstLaunch()).toBe(false);
    });

    it('should handle error in isFirstLaunch', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      expect(await isFirstLaunch()).toBe(true);
    });

    it('should handle error in setFirstLaunchDone', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      await expect(setFirstLaunchDone()).resolves.not.toThrow();
    });
  });

  describe('Custom Tags Storage', () => {
    it('should return default preset tags initially', async () => {
      const tags = await getAllTags();
      expect(tags).toEqual(DEFAULT_PRESET_TAGS);
    });

    it('should add custom tag and return combined tags', async () => {
      const tags = await addCustomTag('読書');
      expect(tags).toContain('読書');
      expect(tags).toEqual([...DEFAULT_PRESET_TAGS, '読書']);
    });

    it('should not duplicate preset or existing custom tags', async () => {
      await addCustomTag('仕事'); // Already in preset
      const tags = await getAllTags();
      expect(tags.filter((t) => t === '仕事')).toHaveLength(1);
    });

    it('should return current tags if empty tag string provided', async () => {
      const tags = await addCustomTag('   ');
      expect(tags).toEqual(DEFAULT_PRESET_TAGS);
    });

    it('should delete custom tag', async () => {
      await addCustomTag('読書');
      const tagsAfterAdd = await getAllTags();
      expect(tagsAfterAdd).toContain('読書');

      const tagsAfterDelete = await deleteCustomTag('読書');
      expect(tagsAfterDelete).not.toContain('読書');
    });

    it('should handle error in getAllTags', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      const tags = await getAllTags();
      expect(tags).toEqual([...DEFAULT_PRESET_TAGS]);
    });

    it('should handle error in addCustomTag', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      await expect(addCustomTag('NEW')).rejects.toThrow('Storage error');
    });

    it('should handle error in deleteCustomTag', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      await expect(deleteCustomTag('TAG')).rejects.toThrow('Storage error');
    });
  });

  describe('User Profile Storage', () => {
    it('should return null when profile is not set', async () => {
      expect(await getUserProfile()).toBeNull();
    });

    it('should save and get user profile', async () => {
      const profile: UserProfile = {
        nickname: 'Taro',
        avatarType: 'emoji',
        avatarValue: '🐱',
        createdAt: '2026-07-28T00:00:00.000Z',
      };

      await saveUserProfile(profile);
      const retrieved = await getUserProfile();
      expect(retrieved).toEqual(profile);
    });

    it('should handle error in getUserProfile', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      expect(await getUserProfile()).toBeNull();
    });

    it('should handle error in saveUserProfile', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      const profile: UserProfile = {
        nickname: 'Taro',
        avatarType: 'emoji',
        avatarValue: '🐱',
        createdAt: '2026-07-28T00:00:00.000Z',
      };
      await expect(saveUserProfile(profile)).rejects.toThrow('Storage error');
    });
  });
});
