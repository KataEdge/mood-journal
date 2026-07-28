import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BreathingGuideModal from '../components/BreathingGuideModal';
import TimePickerModal from '../components/TimePickerModal';
import {
  getReminderSettings,
  saveReminderSettings,
  requestNotificationPermission,
} from '../utils/notifications';
import { ReminderSettings } from '../types';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme';

export default function SafetyScreen() {
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminder, setReminder] = useState<ReminderSettings>({
    enabled: false,
    hour: 21,
    minute: 0,
  });

  useEffect(() => {
    loadReminder();
  }, []);

  const loadReminder = async () => {
    const settings = await getReminderSettings();
    setReminder(settings);
  };

  const handleToggleReminder = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          '通知が許可されていません',
          '設定アプリから感情日記の通知を許可してください。'
        );
        return;
      }
    }

    const updated = { ...reminder, enabled: value };
    setReminder(updated);
    const success = await saveReminderSettings(updated);

    if (value && success) {
      const timeStr = `${updated.hour.toString().padStart(2, '0')}:${updated.minute.toString().padStart(2, '0')}`;
      Alert.alert('リマインダーを設定しました', `毎日 ${timeStr} にお届けします 🔔`);
    }
  };

  const handleSaveTime = async (hour: number, minute: number) => {
    const updated = { ...reminder, hour, minute };
    setReminder(updated);
    if (reminder.enabled) {
      const success = await saveReminderSettings(updated);
      if (success) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        Alert.alert('通知時刻を変更しました', `毎日 ${timeStr} に変更されました 🔔`);
      }
    } else {
      await saveReminderSettings(updated);
    }
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      // 電話アプリがない場合は無視
    });
  };

  const formattedTime = `${reminder.hour.toString().padStart(2, '0')}:${reminder.minute.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ご利用・セルフケア 🌿</Text>
        </View>

        {/* 呼吸法セルフケアカード */}
        <View style={[styles.card, styles.breathingCard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>🍃</Text>
            <Text style={styles.cardTitle}>4-7-8 呼吸法ガイド</Text>
          </View>
          <Text style={styles.cardBody}>
            気分が落ち着かないときや就寝前に。4秒吸って7秒止め、8秒かけてゆっくり吐く深呼吸（3セット）でリラックスを促します。
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowBreathingModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="leaf-outline" size={20} color={Colors.textPrimary} style={styles.actionBtnIcon} />
            <Text style={styles.actionButtonText}>呼吸ガイドを始める (3セット)</Text>
          </TouchableOpacity>
        </View>

        {/* リマインダー通知設定カード */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>🔔</Text>
            <Text style={styles.cardTitle}>毎日の記録リマインダー</Text>
          </View>
          <Text style={styles.cardBody}>
            1日の終わりに気持ちを振り返る時間を。お好みの時刻にやさしいリマインダーをお届けします。
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.timeInfo}>
              <Text style={styles.settingLabel}>毎日の通知</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={16} color={Colors.primaryDark} style={{ marginRight: 4 }} />
                <Text style={styles.timePickerButtonText}>{formattedTime}</Text>
                <Text style={styles.timePickerHint}> (変更)</Text>
              </TouchableOpacity>
            </View>

            <Switch
              value={reminder.enabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={reminder.enabled ? Colors.primaryDark : '#f4f3f4'}
            />
          </View>
        </View>

        {/* 免責事項 */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardTitle}>このアプリについて</Text>
          <Text style={styles.cardBody}>
            「感情日記」は日々の感情を記録し、セルフケアを支援するためのアプリです。
            {'\n\n'}
            記録した情報はお使いの端末内にのみ保存され、外部に送信されることはありません。
          </Text>
        </View>

        {/* 注意事項 */}
        <View style={[styles.card, styles.warningCard]}>
          <Text style={styles.cardIcon}>⚠️</Text>
          <Text style={styles.cardTitle}>ご注意ください</Text>
          <Text style={styles.cardBody}>
            本アプリは医療機関の診断・治療に代わるものではありません。
            {'\n\n'}
            心身の不調が強い場合は、無理をせず専門医や相談機関をご利用ください。
            {'\n\n'}
            気分の記録は、あくまで日々のセルフケアの一環としてお役立てください。
          </Text>
        </View>

        {/* 相談窓口 */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📞</Text>
          <Text style={styles.cardTitle}>相談窓口</Text>
          <Text style={styles.cardSubtitle}>
            つらい時は、一人で抱え込まないでください
          </Text>

          <HelpLine
            name="いのちの電話"
            number="0120-783-556"
            description="毎日16時〜21時、毎月10日は8時〜翌8時"
            onCall={handleCall}
          />
          <HelpLine
            name="よりそいホットライン"
            number="0120-279-338"
            description="24時間対応"
            onCall={handleCall}
          />
          <HelpLine
            name="こころの健康相談統一ダイヤル"
            number="0570-064-556"
            description="各都道府県の相談窓口に接続"
            onCall={handleCall}
          />
        </View>

        {/* ヒント */}
        <View style={[styles.card, styles.tipCard]}>
          <Text style={styles.cardIcon}>💡</Text>
          <Text style={styles.cardTitle}>セルフケアのヒント</Text>
          <View style={styles.tipList}>
            <TipItem text="毎日の気分を記録する習慣をつけましょう" />
            <TipItem text="十分な睡眠をとることを心がけましょう" />
            <TipItem text="適度な運動は心の健康にも効果的です" />
            <TipItem text="信頼できる人に気持ちを話してみましょう" />
            <TipItem text="好きなことをする時間を大切にしましょう" />
          </View>
        </View>

        <Text style={styles.version}>感情日記 v1.1.0</Text>
      </ScrollView>

      {/* 呼吸法ガイドモーダル */}
      <BreathingGuideModal
        visible={showBreathingModal}
        onClose={() => setShowBreathingModal(false)}
      />

      {/* 時刻選択モーダル */}
      <TimePickerModal
        visible={showTimePicker}
        initialHour={reminder.hour}
        initialMinute={reminder.minute}
        onClose={() => setShowTimePicker(false)}
        onSave={handleSaveTime}
      />
    </SafeAreaView>
  );
}

function HelpLine({
  name,
  number,
  description,
  onCall,
}: {
  name: string;
  number: string;
  description: string;
  onCall: (number: string) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.helpLine}
      activeOpacity={0.7}
      onPress={() => onCall(number)}
    >
      <View style={styles.helpLineInfo}>
        <Text style={styles.helpLineName}>{name}</Text>
        <Text style={styles.helpLineDesc}>{description}</Text>
      </View>
      <View style={styles.helpLineNumber}>
        <Text style={styles.helpLineNumberText}>{number}</Text>
        <Text style={styles.helpLineAction}>タップで電話</Text>
      </View>
    </TouchableOpacity>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipItem}>
      <Text style={styles.tipBullet}>🌱</Text>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  breathingCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryDark,
    backgroundColor: '#F3F9FE',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    ...Shadow.sm,
  },
  actionBtnIcon: {
    marginRight: Spacing.xs,
  },
  actionButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  settingLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  timeInfo: {
    flex: 1,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timePickerButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  timePickerHint: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
    backgroundColor: '#FFFDF5',
  },
  tipCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    backgroundColor: '#F5FFF9',
  },
  cardIcon: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  cardBody: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  helpLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  helpLineInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  helpLineName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  helpLineDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  helpLineNumber: {
    alignItems: 'flex-end',
  },
  helpLineNumberText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  helpLineAction: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  tipList: {
    marginTop: Spacing.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  tipBullet: {
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  tipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  version: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

