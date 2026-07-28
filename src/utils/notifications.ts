import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ReminderSettings } from '../types';

const REMINDER_KEY = '@mood_journal_reminder';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  hour: 21,
  minute: 0,
};

// 通知受信時のハンドラー設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * リマインダー設定を取得
 */
export const getReminderSettings = async (): Promise<ReminderSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(REMINDER_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
  } catch (e) {
    console.error('Error loading reminder settings:', e);
  }
  return DEFAULT_REMINDER_SETTINGS;
};

/**
 * リマインダー設定を保存および通知スケジュール更新
 */
export const saveReminderSettings = async (
  settings: ReminderSettings
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(settings));

    if (settings.enabled) {
      return await scheduleDailyReminder(settings.hour, settings.minute);
    } else {
      await cancelDailyReminder();
      return true;
    }
  } catch (e) {
    console.error('Error saving reminder settings:', e);
    return false;
  }
};

/**
 * 通知パーミッションの取得
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

/**
 * 毎日のリマインダー通知を登録
 */
export const scheduleDailyReminder = async (
  hour: number,
  minute: number
): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return false;

  // 既存のすべての定時通知をキャンセル
  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '今日の気分を記録しませんか？ 💭',
      body: '一瞬立ち止まって、今の気持ちを記してみましょう。',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return true;
};

/**
 * リマインダー通知のキャンセル
 */
export const cancelDailyReminder = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
};
