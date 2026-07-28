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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MoodSelector from '../components/MoodSelector';
import SafetyModal from '../components/SafetyModal';
import { MoodOption, MoodLevel, Quote } from '../types';
import { saveMoodEntry, isFirstLaunch, setFirstLaunchDone } from '../utils/storage';
import { getRandomQuote } from '../utils/messages';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme';

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState('');
  const [quote, setQuote] = useState<Quote>(getRandomQuote());
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [saved, setSaved] = useState(false);

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
  }, []);

  // 画面にフォーカスが戻るたびにメッセージを更新
  useFocusEffect(
    useCallback(() => {
      refreshQuote();
    }, [])
  );

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

  const handleSave = async () => {
    if (!selectedMood) return;

    Keyboard.dismiss();

    const entry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      mood: selectedMood,
      note: note.trim(),
      timestamp: new Date().toISOString(),
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
      setNote('');
      refreshQuote();
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <View style={styles.header}>
              <Text style={styles.greeting}>こんにちは 👋</Text>
              <Text style={styles.date}>{dateString}</Text>
            </View>

            {/* 有名人・偉人の名言 */}
            <Animated.View style={[styles.messageCard, { opacity: messageOpacity }]}>
              <Text style={styles.quoteText}>「{quote.text}」</Text>
              <Text style={styles.quoteAuthor}>
                — {quote.author}{quote.authorTitle ? `（${quote.authorTitle}）` : ''}
              </Text>
              <TouchableOpacity
                onPress={refreshQuote}
                style={styles.refreshButton}
                activeOpacity={0.6}
              >
                <Text style={styles.refreshText}>🔄 別の名言を見る</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 気分セレクター */}
            <MoodSelector
              selectedMood={selectedMood}
              onSelect={handleMoodSelect}
            />

            {/* メモ入力 */}
            <View style={styles.noteCard}>
              <Text style={styles.noteLabel}>💭 一言メモ（任意）</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="今の気持ちを一言..."
                placeholderTextColor={Colors.textLight}
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{note.length} / 200</Text>
            </View>

            {/* 保存ボタン */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                !selectedMood && styles.saveButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={!selectedMood || saved}
            >
              <Text style={styles.saveButtonText}>
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
              <Text style={styles.savedText}>
                🎉 今日の気持ちを記録しました
              </Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 初回起動モーダル */}
      <SafetyModal visible={showSafetyModal} onClose={handleSafetyClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
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
  header: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  date: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  messageCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  quoteText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 24,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
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
    color: Colors.primaryDark,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadow.md,
  },
  noteLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  noteInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 80,
    maxHeight: 120,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadow.md,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.border,
    ...Shadow.sm,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  savedMessage: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  savedText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
