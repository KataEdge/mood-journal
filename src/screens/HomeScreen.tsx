import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MoodSelector from '../components/MoodSelector';
import SafetyModal from '../components/SafetyModal';
import BreathingGuideModal from '../components/BreathingGuideModal';
import { TagSelector } from '../components/TagSelector';
import { ThemeHeader } from '../components/ThemeHeader';
import { HealthCard } from '../components/HealthCard';
import { MoodOption, MoodLevel, Quote, HealthData } from '../types';
import { saveMoodEntry, isFirstLaunch, setFirstLaunchDone } from '../utils/storage';
import { getRandomQuote } from '../utils/messages';
import {
  fetchTodayHealthData,
  getHealthSyncPreference,
  setHealthSyncPreference,
} from '../utils/health';
import {
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [quote, setQuote] = useState<Quote>(getRandomQuote());
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [saved, setSaved] = useState(false);

  // ヘルスケア連携ステート
  const [healthEnabled, setHealthEnabled] = useState(true);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // アニメーション値
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const savedAnim = React.useRef(new Animated.Value(0)).current;
  const messageOpacity = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 画面表示アニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 初回起動チェック
    checkFirstLaunch();
    // ヘルスケア連携設定とデータの読み込み
    initHealthSync();
  }, []);

  // 画面にフォーカスが戻るたびにメッセージとヘルスケアデータを更新
  useFocusEffect(
    useCallback(() => {
      refreshQuote();
      loadHealthData();
    }, [])
  );

  const initHealthSync = async () => {
    const enabled = await getHealthSyncPreference();
    setHealthEnabled(enabled);
    if (enabled) {
      loadHealthData();
    }
  };

  const loadHealthData = async () => {
    setHealthLoading(true);
    const data = await fetchTodayHealthData();
    setHealthData(data);
    setHealthLoading(false);
  };

  const handleToggleHealthSync = async (value: boolean) => {
    setHealthEnabled(value);
    await setHealthSyncPreference(value);
    if (value) {
      loadHealthData();
    }
  };

  const checkFirstLaunch = async () => {
    const first = await isFirstLaunch();
    if (first) {
      setShowSafetyModal(true);
    }
  };

  const handleSafetyClose = async () => {
    setShowSafetyModal(false);
    await setFirstLaunchDone();
  };

  const refreshQuote = () => {
    Animated.timing(messageOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setQuote(getRandomQuote());
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleMoodSelect = (option: MoodOption) => {
    setSelectedMood(option.level);
    setSaved(false);
  };

  const handleToggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSave = async () => {
    if (!selectedMood) return;

    Keyboard.dismiss();

    const isLowMood = selectedMood === 4 || selectedMood === 5;

    const entry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      mood: selectedMood,
      note: note.trim(),
      timestamp: new Date().toISOString(),
      tags: selectedTags,
      ...(healthEnabled && healthData ? { healthData } : {}),
    };

    await saveMoodEntry(entry);

    // 保存成功アニメーション
    setSaved(true);
    Animated.sequence([
      Animated.timing(savedAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(savedAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSaved(false);
      setSelectedMood(null);
      setSelectedTags([]);
      setNote('');
      refreshQuote();

      if (isLowMood) {
        Alert.alert(
          '記録を保存しました 🌿',
          '気持ちを記録してくれてありがとうございます。\n4-7-8深呼吸で少し心を落ち着かせませんか？',
          [
            { text: '閉じる', style: 'cancel' },
            {
              text: '深呼吸ガイドを始める',
              onPress: () => setShowBreathingModal(true),
            },
          ]
        );
      }
    });
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* ヘッダー */}
            <ThemeHeader title="こんにちは 👋" subtitle={dateString} />

            {/* 有名人・偉人の名言 */}
            <Animated.View style={[styles.messageCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary, opacity: messageOpacity }]}>
              <Text style={[styles.quoteText, { color: colors.textPrimary }]}>「{quote.text}」</Text>
              <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>
                — {quote.author}{quote.authorTitle ? `（${quote.authorTitle}）` : ''}
              </Text>
              <TouchableOpacity
                onPress={refreshQuote}
                style={styles.refreshButton}
                activeOpacity={0.6}
              >
                <Text style={[styles.refreshText, { color: colors.primaryDark }]}>🔄 別の名言を見る</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 気分セレクター */}
            <MoodSelector
              selectedMood={selectedMood}
              onSelect={handleMoodSelect}
            />

            {/* 感情要因タグセレクター */}
            <TagSelector
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
            />

            {/* ヘルスケア連携カード */}
            <HealthCard
              colors={colors}
              enabled={healthEnabled}
              onToggleEnabled={handleToggleHealthSync}
              healthData={healthData}
              loading={healthLoading}
              onRefresh={loadHealthData}
            />

            {/* メモ入力 */}
            <View style={[styles.noteCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.noteLabel, { color: colors.textPrimary }]}>💭 一言メモ（任意）</Text>
              <TextInput
                style={[styles.noteInput, { backgroundColor: colors.background, color: colors.textPrimary }]}
                placeholder="今の気持ちを一言..."
                placeholderTextColor={colors.textLight}
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: colors.textLight }]}>{note.length} / 200</Text>
            </View>

            {/* 保存ボタン */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
                !selectedMood && { backgroundColor: colors.border },
              ]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={!selectedMood || saved}
            >
              <Text style={[styles.saveButtonText, { color: selectedMood ? colors.textOnPrimary : colors.textLight }]}>
                {saved ? '✓ 保存しました！' : '記録する'}
              </Text>
            </TouchableOpacity>

            {/* 保存成功メッセージ */}
            <Animated.View
              style={[
                styles.savedMessage,
                {
                  opacity: savedAnim,
                  transform: [
                    {
                      translateY: savedAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={[styles.savedText, { color: colors.textSecondary }]}>
                🎉 今日の気持ちを記録しました
              </Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 初回起動モーダル */}
      <SafetyModal visible={showSafetyModal} onClose={handleSafetyClose} />

      {/* 呼吸法ガイドモーダル */}
      <BreathingGuideModal
        visible={showBreathingModal}
        onClose={() => setShowBreathingModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  messageCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    ...Shadow.sm,
  },
  quoteText: {
    fontSize: FontSize.md,
    lineHeight: 24,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontSize: FontSize.sm,
    textAlign: 'right',
    marginTop: Spacing.xs,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  refreshButton: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-end',
  },
  refreshText: {
    fontSize: FontSize.sm,
  },
  noteCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadow.md,
  },
  noteLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  noteInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    minHeight: 80,
    maxHeight: 120,
  },
  charCount: {
    fontSize: FontSize.xs,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  saveButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadow.md,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  savedMessage: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  savedText: {
    fontSize: FontSize.md,
  },
});

