import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MoodSelector from './MoodSelector';
import { TagSelector } from './TagSelector';
import { MoodEntry, MoodLevel, MoodOption } from '../types';
import { FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface EditMoodModalProps {
  visible: boolean;
  entry: MoodEntry | null;
  onClose: () => void;
  onSave: (updatedEntry: MoodEntry) => void;
}

export default function EditMoodModal({
  visible,
  entry,
  onClose,
  onSave,
}: EditMoodModalProps) {
  const { colors } = useTheme();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (entry) {
      setSelectedMood(entry.mood);
      setSelectedTags(entry.tags || []);
      setNote(entry.note || '');
    }
  }, [entry, visible]);

  if (!entry) return null;

  const date = new Date(entry.timestamp);
  const formattedDate = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }) + ' ' + date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleMoodSelect = (option: MoodOption) => {
    setSelectedMood(option.level);
  };

  const handleToggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSave = () => {
    if (!selectedMood) return;

    const updatedEntry: MoodEntry = {
      ...entry,
      mood: selectedMood,
      tags: selectedTags,
      note: note.trim(),
    };

    onSave(updatedEntry);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
              {/* ヘッダー */}
              <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                <View style={styles.headerTitleGroup}>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    記録の編集 ✏️
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {formattedDate}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* フォーム入力部分 */}
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* 気分選択 */}
                <MoodSelector
                  selectedMood={selectedMood}
                  onSelect={handleMoodSelect}
                />

                {/* タグ選択 */}
                <View style={styles.sectionSpacing}>
                  <TagSelector
                    selectedTags={selectedTags}
                    onToggleTag={handleToggleTag}
                  />
                </View>

                {/* メモ入力 */}
                <View style={styles.sectionSpacing}>
                  <Text style={[styles.noteLabel, { color: colors.textPrimary }]}>
                    💭 一言メモ
                  </Text>
                  <TextInput
                    style={[
                      styles.noteInput,
                      { backgroundColor: colors.background, color: colors.textPrimary },
                    ]}
                    placeholder="今の気持ちを一言..."
                    placeholderTextColor={colors.textLight}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    maxLength={200}
                    textAlignVertical="top"
                  />
                  <Text style={[styles.charCount, { color: colors.textLight }]}>
                    {note.length} / 200
                  </Text>
                </View>
              </ScrollView>

              {/* アクションボタン */}
              <View style={[styles.footer, { borderTopColor: colors.divider }]}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    キャンセル
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                    !selectedMood && { backgroundColor: colors.border },
                  ]}
                  onPress={handleSave}
                  disabled={!selectedMood}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      { color: selectedMood ? colors.textOnPrimary : colors.textLight },
                    ]}
                  >
                    保存する
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    maxHeight: '90%',
    width: '100%',
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.md,
    maxHeight: '100%',
    ...Shadow.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    maxHeight: 450,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  sectionSpacing: {
    marginTop: Spacing.lg,
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
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  saveButton: {
    ...Shadow.sm,
  },
  saveButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
