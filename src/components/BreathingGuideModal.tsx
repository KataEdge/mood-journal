import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow, MOOD_OPTIONS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { BreathingSession, MoodLevel, MoodEntry } from '../types';
import { saveMoodEntry } from '../utils/storage';

interface BreathingGuideModalProps {
  visible: boolean;
  onClose: () => void;
  onCompleteWithBreathing?: (session: BreathingSession) => void;
  targetEntry?: MoodEntry | null;
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'completed';

export default function BreathingGuideModal({
  visible,
  onClose,
  onCompleteWithBreathing,
  targetEntry,
}: BreathingGuideModalProps) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('idle');
  const [cycleCount, setCycleCount] = useState(0); // 1 ~ 3
  const [countdown, setCountdown] = useState(0);
  const [selectedMood, setSelectedMood] = useState<MoodLevel>(targetEntry?.mood || 3);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(targetEntry?.id || null);

  const circleScale = useRef(new Animated.Value(1)).current;
  const isRunning = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      resetBreathing();
    } else if (targetEntry) {
      setSelectedMood(targetEntry.mood);
      setSavedEntryId(targetEntry.id);
    }
  }, [visible, targetEntry]);

  const resetBreathing = () => {
    isRunning.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('idle');
    setCycleCount(0);
    setCountdown(0);
    setSavedEntryId(targetEntry?.id || null);
    setSelectedMood(targetEntry?.mood || 3);
    circleScale.setValue(1);
  };

  const startBreathingCycle = () => {
    isRunning.current = true;
    runCycle(1);
  };

  const runCycle = (currentCycle: number) => {
    if (!isRunning.current) return;

    setCycleCount(currentCycle);

    // Phase 1: Inhale (4 seconds)
    setPhase('inhale');
    setCountdown(4);
    startCountdown(4);

    Animated.timing(circleScale, {
      toValue: 2.0,
      duration: 4000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || !isRunning.current) return;

      // Phase 2: Hold (7 seconds)
      setPhase('hold');
      setCountdown(7);
      startCountdown(7);

      setTimeout(() => {
        if (!isRunning.current) return;

        // Phase 3: Exhale (8 seconds)
        setPhase('exhale');
        setCountdown(8);
        startCountdown(8);

        Animated.timing(circleScale, {
          toValue: 1.0,
          duration: 8000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start(({ finished: exhaledFinished }) => {
          if (!exhaledFinished || !isRunning.current) return;

          if (currentCycle >= 3) {
            // 3セット完了
            setPhase('completed');
            isRunning.current = false;
            autoSaveBreathingEntry(3, 3);
          } else {
            // 次のセットへ
            runCycle(currentCycle + 1);
          }
        });
      }, 7000);
    });
  };

  const autoSaveBreathingEntry = async (
    cycles: number,
    mood: MoodLevel,
    existingId?: string | null
  ) => {
    const entryId =
      existingId ||
      targetEntry?.id ||
      savedEntryId ||
      Date.now().toString() + Math.random().toString(36).slice(2, 9);
    setSavedEntryId(entryId);

    const session: BreathingSession = {
      completedCycles: cycles,
      completedAt: new Date().toISOString(),
    };

    const existingTags = targetEntry?.tags || [];
    const updatedTags = existingTags.includes('呼吸法')
      ? existingTags
      : [...existingTags, '呼吸法'];

    const entry: MoodEntry = {
      id: entryId,
      mood: mood,
      note: targetEntry ? targetEntry.note : '4-7-8呼吸法を実践 🍃',
      timestamp: targetEntry ? targetEntry.timestamp : new Date().toISOString(),
      tags: targetEntry ? updatedTags : ['呼吸法'],
      healthData: targetEntry?.healthData,
      breathingSession: session,
    };

    await saveMoodEntry(entry);

    if (onCompleteWithBreathing) {
      onCompleteWithBreathing(session);
    }
  };

  const handleMoodSelectInModal = (level: MoodLevel) => {
    setSelectedMood(level);
    autoSaveBreathingEntry(cycleCount > 0 ? cycleCount : 3, level, savedEntryId);
  };

  const startCountdown = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let current = seconds;
    timerRef.current = setInterval(() => {
      current -= 1;
      if (current >= 0) {
        setCountdown(current);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return '鼻から息を吸って…';
      case 'hold':
        return '息を止めて…';
      case 'exhale':
        return '口からゆっくり吐いて…';
      case 'completed':
        return '✅ 4-7-8呼吸法の実践を自動記録しました！\nいまの気持ちを選んで更新できます 🍃';
      default:
        return 'リラックスして準備ができたらスタートを押してください';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return '#81C784'; // Soft green
      case 'hold':
        return '#FFB74D'; // Soft orange
      case 'exhale':
        return '#64B5F6'; // Soft blue
      case 'completed':
        return colors.primaryDark;
      default:
        return colors.primaryDark;
    }
  };

  const handleCompleteAndRecord = () => {
    if (onCompleteWithBreathing) {
      onCompleteWithBreathing({
        completedCycles: cycleCount > 0 ? cycleCount : 3,
        completedAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            4-7-8 呼吸法ガイド 🍃
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-outline" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* 呼吸サークル & カウントダウン */}
        <View style={styles.content}>
          <Text style={[styles.cycleText, { color: colors.textSecondary }]}>
            {phase === 'completed'
              ? '3セット完了！'
              : cycleCount > 0
                ? `セット ${cycleCount} / 3`
                : '心と体を落ち着かせるリラックス呼吸（全3セット）'}
          </Text>

          <View style={styles.circleContainer}>
            {/* バックグラウンド波紋風リング */}
            <View style={[styles.outerRing, { borderColor: colors.border }]} />

            {/* メインの拡大・縮小サークル */}
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  backgroundColor: getPhaseColor(),
                  transform: [{ scale: circleScale }],
                },
              ]}
            />

            {/* 中央カウントダウン */}
            <View style={styles.centerOverlay}>
              {phase === 'completed' ? (
                <Ionicons name="sparkles" size={48} color="#FFFFFF" />
              ) : phase !== 'idle' ? (
                <Text style={styles.countdownText}>{countdown}</Text>
              ) : (
                <Ionicons name="leaf-outline" size={48} color="#FFFFFF" />
              )}
            </View>
          </View>

          {/* フェーズ案内テキスト */}
          <Text style={[styles.phaseInstruction, { color: getPhaseColor() }]}>
            {getPhaseText()}
          </Text>
        </View>

        {/* フッター操作ボタン */}
        <View style={styles.footer}>
          {phase === 'idle' ? (
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={startBreathingCycle}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={22} color={colors.textOnPrimary} style={styles.btnIcon} />
              <Text style={[styles.startButtonText, { color: colors.textOnPrimary }]}>
                セッションを開始 (3セット)
              </Text>
            </TouchableOpacity>
          ) : phase === 'completed' ? (
            <View style={{ gap: Spacing.md }}>
              <View style={styles.moodSelectorRow}>
                {MOOD_OPTIONS.map((item) => {
                  const isSelected = selectedMood === item.level;
                  return (
                    <TouchableOpacity
                      key={item.level}
                      style={[
                        styles.moodMiniItem,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        isSelected && {
                          borderColor: colors.primary,
                          backgroundColor: colors.primary + '15',
                        },
                      ]}
                      onPress={() => handleMoodSelectInModal(item.level)}
                    >
                      <Text style={styles.moodMiniEmoji}>{item.emoji}</Text>
                      <Text
                        style={[
                          styles.moodMiniLabel,
                          { color: isSelected ? colors.primaryDark : colors.textSecondary },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: colors.primary }]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark"
                  size={22}
                  color={colors.textOnPrimary}
                  style={styles.btnIcon}
                />
                <Text style={[styles.startButtonText, { color: colors.textOnPrimary }]}>
                  完了する
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.stopButton,
                  { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                ]}
                onPress={startBreathingCycle}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={colors.textPrimary}
                  style={styles.btnIcon}
                />
                <Text style={[styles.stopButtonText, { color: colors.textPrimary }]}>
                  もう一度行う
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: colors.accent }]}
              onPress={resetBreathing}
              activeOpacity={0.8}
            >
              <Ionicons name="stop" size={22} color="#FFF" style={styles.btnIcon} />
              <Text style={styles.stopButtonText}>リセット</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  cycleText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
    fontWeight: '500',
  },
  circleContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  breathingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.85,
    ...Shadow.md,
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.surface,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  phaseInstruction: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginTop: Spacing.xxl,
    textAlign: 'center',
    minHeight: 60,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  startButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stopButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  stopButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFF',
  },
  btnIcon: {
    marginRight: Spacing.xs,
  },
  moodSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  moodMiniItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    minWidth: 56,
  },
  moodMiniEmoji: {
    fontSize: 24,
  },
  moodMiniLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
