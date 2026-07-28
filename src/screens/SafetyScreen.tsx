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
import { ThemeHeader } from '../components/ThemeHeader';
import {
  getReminderSettings,
  saveReminderSettings,
  requestNotificationPermission,
} from '../utils/notifications';
import { ReminderSettings, ThemeType } from '../types';
import { getMoodEntries } from '../utils/storage';
import { checkAndEvaluateBadges } from '../utils/streak';
import {
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function SafetyScreen() {
  const { theme, colors, setTheme } = useTheme();
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

  const themeOptions: { type: ThemeType; label: string; icon: string; desc: string }[] = [
    { type: 'light', label: 'ノーマル', icon: 'sparkles', desc: 'パステルで爽やか' },
    { type: 'dark', label: 'ダーク', icon: 'moon', desc: '目に優しいシック' },
    { type: 'warm', label: 'ウォーム', icon: 'sunny', desc: '温かみのある暖色' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemeHeader title="ご利用・設定 🌿" />
        </View>

        {/* カラーテーマ設定カード */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>🎨</Text>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>カラーテーマ設定</Text>
          </View>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            アプリ全体の配色をお好みに合わせて変更できます。
          </Text>

          <View style={styles.themeSelectorRow}>
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.type;
              return (
                <TouchableOpacity
                  key={opt.type}
                  style={[
                    styles.themeOptionCard,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    isSelected && { borderColor: colors.primaryDark, borderWidth: 2, backgroundColor: colors.surfaceElevated },
                  ]}
                  onPress={() => setTheme(opt.type)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={22}
                    color={isSelected ? colors.primaryDark : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      { color: colors.textPrimary },
                      isSelected && { color: colors.primaryDark, fontWeight: '700' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={[styles.themeOptionDesc, { color: colors.textLight }]}>{opt.desc}</Text>
                  {isSelected && (
                    <View style={[styles.themeCheckBadge, { backgroundColor: colors.primaryDark }]}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 呼吸法セルフケアカード */}
        <View style={[styles.card, styles.breathingCard, { backgroundColor: colors.surface, borderLeftColor: colors.primaryDark }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>🍃</Text>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>4-7-8 呼吸法ガイド</Text>
          </View>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            気分が落ち着かないときや就寝前に。4秒吸って7秒止め、8秒かけてゆっくり吐く深呼吸（3セット）でリラックスを促します。
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowBreathingModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="leaf-outline" size={20} color={colors.textOnPrimary} style={styles.actionBtnIcon} />
            <Text style={[styles.actionButtonText, { color: colors.textOnPrimary }]}>呼吸ガイドを始める (3セット)</Text>
          </TouchableOpacity>
        </View>

        {/* リマインダー通知設定カード */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>🔔</Text>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>毎日の記録リマインダー</Text>
          </View>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            1日の終わりに気持ちを振り返る時間を。お好みの時刻にやさしいリマインダーをお届けします。
          </Text>

          <View style={[styles.settingRow, { borderTopColor: colors.divider }]}>
            <View style={styles.timeInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>毎日の通知</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={16} color={colors.primaryDark} style={{ marginRight: 4 }} />
                <Text style={[styles.timePickerButtonText, { color: colors.primaryDark }]}>{formattedTime}</Text>
                <Text style={[styles.timePickerHint, { color: colors.textLight }]}> (変更)</Text>
              </TouchableOpacity>
            </View>

            <Switch
              value={reminder.enabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={reminder.enabled ? colors.primaryDark : '#f4f3f4'}
            />
          </View>
        </View>

        {/* 継続をサポートする3つの仕組みガイド */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>✨</Text>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              継続をサポートする3つの仕組み
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
            感情日記を楽しく無理なく続けるためのモチベーション機能のご案内です。
          </Text>

          {/* 1. ココロの木 */}
          <View style={[styles.guideBox, { backgroundColor: `${colors.primary}12` }]}>
            <Text style={styles.guideBoxEmoji}>🌱</Text>
            <View style={styles.guideBoxContent}>
              <Text style={[styles.guideBoxTitle, { color: colors.textPrimary }]}>
                1. 成長する「ココロの木」
              </Text>
              <Text style={[styles.guideBoxText, { color: colors.textSecondary }]}>
                感情の記録や呼吸法を行うと「水やり（XP）」が完了し、芽ばえ🌱からすこやか新緑🌿・満開の木🌸へとレベルアップ成長します。
              </Text>
            </View>
          </View>

          {/* 2. ストリークフリーズ */}
          <View style={[styles.guideBox, { backgroundColor: '#E0F2FE' }]}>
            <Text style={styles.guideBoxEmoji}>❄️</Text>
            <View style={styles.guideBoxContent}>
              <Text style={[styles.guideBoxTitle, { color: colors.textPrimary }]}>
                2. ストリークフリーズ（1日救済）
              </Text>
              <Text style={[styles.guideBoxText, { color: colors.textSecondary }]}>
                うっかり1日記録を忘れても、週1回自動補充されるフリーズチケット（1日救済）が働き、連続記録が途切れるのを防ぎます。
              </Text>
            </View>
          </View>

          {/* 3. 週次感情レポート */}
          <View style={[styles.guideBox, { backgroundColor: `${colors.secondary}15` }]}>
            <Text style={styles.guideBoxEmoji}>📊</Text>
            <View style={styles.guideBoxContent}>
              <Text style={[styles.guideBoxTitle, { color: colors.textPrimary }]}>
                3. 週末感情レポート
              </Text>
              <Text style={[styles.guideBoxText, { color: colors.textSecondary }]}>
                週末（土・日）になるとホーム画面にレポートが届き、1週間の記録日数・感情バランス・よく使ったタグを振り返ることができます。
              </Text>
            </View>
          </View>
        </View>

        {/* 免責事項 */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>このアプリについて</Text>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            「感情日記」は日々の感情を記録し、セルフケアを支援するためのアプリです。
            {'\n\n'}
            記録した情報はお使いの端末内にのみ保存され、外部に送信されることはありません。
          </Text>
        </View>

        {/* 注意事項 */}
        <View style={[styles.card, styles.warningCard, { backgroundColor: colors.surface, borderLeftColor: colors.warning }]}>
          <Text style={styles.cardIcon}>⚠️</Text>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>ご注意ください</Text>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            本アプリは医療機関の診断・治療に代わるものではありません。
            {'\n\n'}
            心身の不調が強い場合は、無理をせず専門医や相談機関をご利用ください。
            {'\n\n'}
            気分の記録は、あくまで日々のセルフケアの一環としてお役立てください。
          </Text>
        </View>

        {/* 相談窓口 */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={styles.cardIcon}>📞</Text>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>相談窓口</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
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
        <View style={[styles.card, styles.tipCard, { backgroundColor: colors.surface, borderLeftColor: colors.success }]}>
          <Text style={styles.cardIcon}>💡</Text>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>セルフケアのヒント</Text>
          <View style={styles.tipList}>
            <TipItem text="毎日の気分を記録する習慣をつけましょう" />
            <TipItem text="十分な睡眠をとることを心がけましょう" />
            <TipItem text="適度な運動は心の健康にも効果的です" />
            <TipItem text="信頼できる人に気持ちを話してみましょう" />
            <TipItem text="好きなことをする時間を大切にしましょう" />
          </View>
        </View>

        <Text style={[styles.version, { color: colors.textLight }]}>感情日記 v1.1.0</Text>
      </ScrollView>

      {/* 呼吸法ガイドモーダル */}
      <BreathingGuideModal
        visible={showBreathingModal}
        onClose={() => setShowBreathingModal(false)}
        onCompleteWithBreathing={async () => {
          const entries = await getMoodEntries();
          await checkAndEvaluateBadges(entries, 1);
        }}
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
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.helpLine, { backgroundColor: colors.background }]}
      activeOpacity={0.7}
      onPress={() => onCall(number)}
    >
      <View style={styles.helpLineInfo}>
        <Text style={[styles.helpLineName, { color: colors.textPrimary }]}>{name}</Text>
        <Text style={[styles.helpLineDesc, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <View style={styles.helpLineNumber}>
        <Text style={[styles.helpLineNumberText, { color: colors.primaryDark }]}>{number}</Text>
        <Text style={[styles.helpLineAction, { color: colors.textLight }]}>タップで電話</Text>
      </View>
    </TouchableOpacity>
  );
}

function TipItem({ text }: { text: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.tipItem}>
      <Text style={styles.tipBullet}>🌱</Text>
      <Text style={[styles.tipText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.md,
  },
  card: {
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
  themeSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  themeOptionCard: {
    flex: 1,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  themeOptionLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    marginTop: 4,
  },
  themeOptionDesc: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  themeCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCard: {
    borderLeftWidth: 4,
  },
  actionButton: {
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
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  settingLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
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
  },
  timePickerHint: {
    fontSize: FontSize.xs,
  },
  warningCard: {
    borderLeftWidth: 4,
  },
  tipCard: {
    borderLeftWidth: 4,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  cardBody: {
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  helpLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  helpLineDesc: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  helpLineNumber: {
    alignItems: 'flex-end',
  },
  helpLineNumberText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  helpLineAction: {
    fontSize: FontSize.xs,
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
    flex: 1,
    lineHeight: 20,
  },
  version: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  guideBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  guideBoxEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  guideBoxContent: {
    flex: 1,
  },
  guideBoxTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  guideBoxText: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
  },
});


