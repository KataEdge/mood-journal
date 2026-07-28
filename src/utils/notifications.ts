import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ReminderSettings, ReminderItem } from '../types';

const REMINDER_KEY = '@mood_journal_reminder';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  masterEnabled: false,
  reminders: [
    {
      id: 'morning_default',
      title: '朝の気分チェック',
      hour: 9,
      minute: 0,
      enabled: true,
    },
    {
      id: 'evening_default',
      title: '夜の振り返り',
      hour: 21,
      minute: 0,
      enabled: true,
    },
  ],
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
 * リマインダー設定を取得 (旧設定からの自動移行含む)
 */
export const getReminderSettings = async (): Promise<ReminderSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(REMINDER_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);

      // 旧設定フォーマット ({ enabled: boolean, hour: number, minute: number }) からのマイグレーション
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'hour' in parsed &&
        !('reminders' in parsed)
      ) {
        const migrated: ReminderSettings = {
          masterEnabled: parsed.enabled ?? false,
          reminders: [
            {
              id: 'migrated_default',
              title: '毎日のリマインダー',
              hour: typeof parsed.hour === 'number' ? parsed.hour : 21,
              minute: typeof parsed.minute === 'number' ? parsed.minute : 0,
              enabled: parsed.enabled ?? true,
            },
          ],
        };
        await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(migrated));
        return migrated;
      }

      return parsed as ReminderSettings;
    }
  } catch (e) {
    console.error('Error loading reminder settings:', e);
  }
  return DEFAULT_REMINDER_SETTINGS;
};

/**
 * リマインダー設定を保存および通知スケジュール更新
 */
export const saveReminderSettings = async (settings: ReminderSettings): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(settings));

    if (settings.masterEnabled) {
      return await scheduleAllReminders(settings.reminders);
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
 * 登録されているすべての有効なリマインダー通知をスケジュール登録
 */
export const scheduleAllReminders = async (reminders: ReminderItem[]): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return false;

  // 既存のすべての定時通知を一度キャンセル
  await cancelDailyReminder();

  const enabledReminders = reminders.filter((r) => r.enabled);
  for (const item of enabledReminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${item.title} 💭`,
        body: '一瞬立ち止まって、今の気持ちを記してみましょう。',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: item.hour,
        minute: item.minute,
      },
    });
  }

  return true;
};

/**
 * 単一のリマインダー通知を登録 (後方互換用)
 */
export const scheduleDailyReminder = async (hour: number, minute: number): Promise<boolean> => {
  return scheduleAllReminders([
    {
      id: 'legacy_single',
      title: '毎日のリマインダー',
      hour,
      minute,
      enabled: true,
    },
  ]);
};

/**
 * リマインダー通知のすべてをキャンセル
 */
export const cancelDailyReminder = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
};
