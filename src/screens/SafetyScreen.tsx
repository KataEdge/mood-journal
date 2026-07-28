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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BreathingGuideModal from '../components/BreathingGuideModal';
import ProfileSetupModal from '../components/ProfileSetupModal';
import ReminderEditModal from '../components/ReminderEditModal';
import { ThemeHeader } from '../components/ThemeHeader';
import {
  getReminderSettings,
  saveReminderSettings,
  requestNotificationPermission,
} from '../utils/notifications';
import { ReminderSettings, ReminderItem, ThemeType, UserProfile } from '../types';
import { getMoodEntries, getUserProfile, saveUserProfile } from '../utils/storage';
import { checkAndEvaluateBadges } from '../utils/streak';
import { FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function SafetyScreen() {
  const { theme, colors, setTheme } = useTheme();
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [reminder, setReminder] = useState<ReminderSettings>({
    masterEnabled: false,
    reminders: [],
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ReminderItem | null>(null);

  useEffect(() => {
    loadReminder();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await getUserProfile();
    setUserProfile(profile);
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    await saveUserProfile(profile);
    setUserProfile(profile);
    setShowProfileModal(false);
  };

  const loadReminder = async () => {
    const settings = await getReminderSettings();
    setReminder(settings);
  };

  const handleToggleMaster = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('通知が許可されていません', '設定アプリから感情日記の通知を許可してください。');
        return;
      }
    }

    const updated = { ...reminder, masterEnabled: value };
    setReminder(updated);
    const success = await saveReminderSettings(updated);

    if (value && success) {
      Alert.alert('リマインダーを有効にしました', '設定された時刻に通知をお届けします 🔔');
    }
  };

  const handleToggleItem = async (id: string, value: boolean) => {
    const updatedReminders = reminder.reminders.map((item) =>
      item.id === id ? { ...item, enabled: value } : item
    );
    const updated = { ...reminder, reminders: updatedReminders };
    setReminder(updated);
    await saveReminderSettings(updated);
  };

  const handleOpenAddModal = () => {
    if (reminder.reminders.length >= 5) {
      Alert.alert('登録上限', 'リマインダーは最大5件まで登録できます。');
      return;
    }
    setEditingItem(null);
    setShowEditModal(true);
  };

  const handleOpenEditModal = (item: ReminderItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleDeleteReminder = (id: string) => {
    Alert.alert('リマインダーの削除', 'このリマインダーを削除してもよろしいですか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          const updatedReminders = reminder.reminders.filter((r) => r.id !== id);
          const updated = { ...reminder, reminders: updatedReminders };
          setReminder(updated);
          await saveReminderSettings(updated);
        },
      },
    ]);
  };

  const handleSaveReminderModal = async (title: string, hour: number, minute: number) => {
    let updatedReminders: ReminderItem[];

    if (editingItem) {
      updatedReminders = reminder.reminders.map((item) =>
        item.id === editingItem.id ? { ...item, title, hour, minute } : item
      );
    } else {
      const newItem: ReminderItem = {
        id: `reminder_${Date.now()}`,
        title,
        hour,
        minute,
        enabled: true,
      };
      updatedReminders = [...reminder.reminders, newItem];
    }

    const updated = { ...reminder, reminders: updatedReminders };
    setReminder(updated);
    await saveReminderSettings(updated);
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      // 電話アプリがない場合は無視
    });
  };

  const themeOptions: { type: ThemeType; label: string; icon: string; desc: string }[] = [
    { type: 'light', label: 'ノーマル', icon: 'sparkles', desc: 'パステルで爽やか' },
    { type: 'dark', label: 'ダーク', icon: 'moon', desc: '目に優しいシック' },
    { type: 'warm', label: 'ウォーム', icon: 'sunny', desc: '温かみのある暖色' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemeHeader title="ご利用・設定 🌿" />
        </View>

        {/* プロフィール（ニックネーム・アバター）設定カード */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>プロフィール設定</Text>
          </View>
          <Text
            style={[styles.cardBody, { color: colors.textSecondary, marginBottom: Spacing.sm }]}
          >
            アプリ内で表示されるニックネームとアバターを変更できます。
          </Text>

          <View style={[styles.profileCardRow, { backgroundColor: colors.background }]}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: colors.tagBg, borderColor: colors.primary },
              ]}
            >
              {userProfile?.avatarType === 'image' ? (
                <Image source={{ uri: userProfile.avatarValue }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarEmoji}>{userProfile?.avatarValue || '🐱'}</Text>
              )}
            </View>
            <View style={styles.profileTextInfo}>
              <Text style={[styles.profileNickname, { color: colors.textPrimary }]}>
                {userProfile?.nickname || '未設定'}
              </Text>
              <Text style={[styles.profileSubtext, { color: colors.textLight }]}>
                タップして編集・変更
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.editProfileButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowProfileModal(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.editProfileButtonText, { color: colors.textOnPrimary }]}>
                編集
              </Text>
            </TouchableOpacity>
          </View>
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
                    isSelected && {
                      borderColor: colors.primaryDark,
                      borderWidth: 2,
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                  onPress={() => setTheme(opt.type)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={opt.icon as React.ComponentProps<typeof Ionicons>['name']}
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
                  <Text style={[styles.themeOptionDesc, { color: colors.textLight }]}>
                    {opt.desc}
                  </Text>
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
        <View
          style={[
            styles.card,
            styles.breathingCard,
            { backgroundColor: colors.surface, borderLeftColor: colors.primaryDark },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>🍃</Text>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              4-7-8 呼吸法ガイド
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            気分が落ち着かないときや就寝前に。4秒吸って7秒止め、8秒かけてゆっくり吐く深呼吸（3セット）でリラックスを促します。
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowBreathingModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="leaf-outline"
              size={20}
              color={colors.textOnPrimary}
              style={styles.actionBtnIcon}
            />
            <Text style={[styles.actionButtonText, { color: colors.textOnPrimary }]}>
              呼吸ガイドを始める (3セット)
            </Text>
          </TouchableOpacity>
        </View>

        {/* リマインダー通知設定カード */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>🔔</Text>
            <Text style={[styles.cardTitle, { color: colors.textPrimary, flex: 1 }]}>
              記録リマインダー
            </Text>
            <Switch
              value={reminder.masterEnabled}
              onValueChange={handleToggleMaster}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={reminder.masterEnabled ? colors.primaryDark : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            生活リズムに合わせて複数のリマインダーを設定できます（最大5件）。
          </Text>

          {/* リマインダーリスト */}
          <View style={[styles.reminderListContainer, { borderTopColor: colors.divider }]}>
            {reminder.reminders.map((item) => {
              const timeStr = `${item.hour.toString().padStart(2, '0')}:${item.minute.toString().padStart(2, '0')}`;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.reminderListItem,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.reminderItemLeft}>
                    <TouchableOpacity
                      onPress={() => handleOpenEditModal(item)}
                      style={styles.reminderTitleRow}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.reminderItemTitle, { color: colors.textPrimary }]}>
                        {item.title}
                      </Text>
                      <Ionicons
                        name="pencil-outline"
                        size={14}
                        color={colors.textLight}
                        style={{ marginLeft: 4 }}
                      />
                    </TouchableOpacity>
                    <Text style={[styles.reminderItemTime, { color: colors.primaryDark }]}>
                      {timeStr}
                    </Text>
                  </View>

                  <View style={styles.reminderItemRight}>
                    <Switch
                      value={item.enabled && reminder.masterEnabled}
                      disabled={!reminder.masterEnabled}
                      onValueChange={(val) => handleToggleItem(item.id, val)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={
                        item.enabled && reminder.masterEnabled ? colors.primaryDark : '#f4f3f4'
                      }
                    />
                    <TouchableOpacity
                      onPress={() => handleDeleteReminder(item.id)}
                      style={styles.deleteIconButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* リマインダー追加ボタン */}
            {reminder.reminders.length < 5 && (
              <TouchableOpacity
                style={[styles.addReminderButton, { borderColor: colors.primary }]}
                onPress={handleOpenAddModal}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.primaryDark} />
                <Text style={[styles.addReminderButtonText, { color: colors.primaryDark }]}>
                  リマインダーを追加 ({reminder.reminders.length}/5)
                </Text>
              </TouchableOpacity>
            )}
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
          <Text
            style={[styles.cardBody, { color: colors.textSecondary, marginBottom: Spacing.md }]}
          >
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
        <View
          style={[
            styles.card,
            styles.warningCard,
            { backgroundColor: colors.surface, borderLeftColor: colors.warning },
          ]}
        >
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
        <View
          style={[
            styles.card,
            styles.tipCard,
            { backgroundColor: colors.surface, borderLeftColor: colors.success },
          ]}
        >
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

      {/* リマインダー編集・追加モーダル */}
      <ReminderEditModal
        visible={showEditModal}
        initialItem={editingItem}
        onSave={handleSaveReminderModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
      />

      {/* プロフィール設定モーダル */}
      <ProfileSetupModal
        visible={showProfileModal}
        initialProfile={userProfile}
        onSave={handleSaveProfile}
        onClose={() => setShowProfileModal(false)}
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
  reminderListContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  reminderListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  reminderItemLeft: {
    flex: 1,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderItemTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  reminderItemTime: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginTop: 2,
  },
  reminderItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deleteIconButton: {
    padding: Spacing.xs,
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  addReminderButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
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
  profileCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileTextInfo: {
    flex: 1,
  },
  profileNickname: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  profileSubtext: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  editProfileButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  editProfileButtonText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
});
