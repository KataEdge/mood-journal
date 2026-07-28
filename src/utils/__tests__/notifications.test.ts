import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  DEFAULT_REMINDER_SETTINGS,
  getReminderSettings,
  saveReminderSettings,
  requestNotificationPermission,
  scheduleAllReminders,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../notifications';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id-123'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
  },
}));

describe('notifications utility', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = 'ios';
  });

  describe('getReminderSettings', () => {
    it('should return DEFAULT_REMINDER_SETTINGS when nothing stored', async () => {
      const settings = await getReminderSettings();
      expect(settings).toEqual(DEFAULT_REMINDER_SETTINGS);
    });

    it('should migrate legacy reminder settings format', async () => {
      const legacySetting = { enabled: true, hour: 20, minute: 30 };
      await AsyncStorage.setItem('@mood_journal_reminder', JSON.stringify(legacySetting));

      const settings = await getReminderSettings();
      expect(settings.masterEnabled).toBe(true);
      expect(settings.reminders).toHaveLength(1);
      expect(settings.reminders[0].hour).toBe(20);
      expect(settings.reminders[0].minute).toBe(30);
    });

    it('should handle legacy setting without explicit hour/minute', async () => {
      const legacySetting = { hour: 'invalid' };
      await AsyncStorage.setItem('@mood_journal_reminder', JSON.stringify(legacySetting));

      const settings = await getReminderSettings();
      expect(settings.reminders[0].hour).toBe(21);
      expect(settings.reminders[0].minute).toBe(0);
    });

    it('should return stored new format reminder settings', async () => {
      const stored = {
        masterEnabled: true,
        reminders: [{ id: '1', title: 'Test', hour: 10, minute: 15, enabled: true }],
      };
      await AsyncStorage.setItem('@mood_journal_reminder', JSON.stringify(stored));

      const settings = await getReminderSettings();
      expect(settings).toEqual(stored);
    });

    it('should handle error when reading reminder settings fails', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      const settings = await getReminderSettings();
      expect(settings).toEqual(DEFAULT_REMINDER_SETTINGS);
    });
  });

  describe('saveReminderSettings', () => {
    it('should save settings and schedule reminders if masterEnabled is true', async () => {
      const settings = {
        masterEnabled: true,
        reminders: [{ id: '1', title: 'Test Reminder', hour: 9, minute: 0, enabled: true }],
      };

      const result = await saveReminderSettings(settings);
      expect(result).toBe(true);

      const stored = await AsyncStorage.getItem('@mood_journal_reminder');
      expect(JSON.parse(stored!)).toEqual(settings);
    });

    it('should cancel reminders if masterEnabled is false', async () => {
      const settings = {
        masterEnabled: false,
        reminders: [{ id: '1', title: 'Test Reminder', hour: 9, minute: 0, enabled: true }],
      };

      const result = await saveReminderSettings(settings);
      expect(result).toBe(true);
    });

    it('should handle error when saving settings fails', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      const settings = {
        masterEnabled: false,
        reminders: [],
      };
      const result = await saveReminderSettings(settings);
      expect(result).toBe(false);
    });
  });

  describe('requestNotificationPermission', () => {
    it('should return true when permissions are granted', async () => {
      const result = await requestNotificationPermission();
      expect(result).toBe(true);
    });

    it('should request permissions if existing status is not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const result = await requestNotificationPermission();
      expect(result).toBe(true);
    });

    it('should return false if requested permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await requestNotificationPermission();
      expect(result).toBe(false);
    });

    it('should return false when Platform.OS is web', async () => {
      (Platform as { OS: string }).OS = 'web';
      const result = await requestNotificationPermission();
      expect(result).toBe(false);
    });
  });

  describe('scheduleAllReminders', () => {
    it('should schedule enabled reminders', async () => {
      const reminders = [
        { id: '1', title: 'Morning', hour: 9, minute: 0, enabled: true },
        { id: '2', title: 'Evening', hour: 21, minute: 0, enabled: false },
      ];

      const result = await scheduleAllReminders(reminders);
      expect(result).toBe(true);
    });

    it('should return false if notification permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const reminders = [{ id: '1', title: 'Morning', hour: 9, minute: 0, enabled: true }];
      const result = await scheduleAllReminders(reminders);
      expect(result).toBe(false);
    });

    it('should return false when Platform.OS is web', async () => {
      (Platform as { OS: string }).OS = 'web';
      const reminders = [{ id: '1', title: 'Morning', hour: 9, minute: 0, enabled: true }];
      const result = await scheduleAllReminders(reminders);
      expect(result).toBe(false);
    });
  });

  describe('scheduleDailyReminder & cancelDailyReminder', () => {
    it('should schedule single daily reminder', async () => {
      const result = await scheduleDailyReminder(12, 30);
      expect(result).toBe(true);
    });

    it('should cancel all scheduled notifications', async () => {
      await expect(cancelDailyReminder()).resolves.not.toThrow();
    });

    it('should do nothing on web when canceling notifications', async () => {
      (Platform as { OS: string }).OS = 'web';
      await expect(cancelDailyReminder()).resolves.not.toThrow();
    });
  });
});
