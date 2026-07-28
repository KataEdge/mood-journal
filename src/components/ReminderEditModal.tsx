import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReminderItem } from '../types';
import { FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface ReminderEditModalProps {
  visible: boolean;
  initialItem?: ReminderItem | null;
  onSave: (title: string, hour: number, minute: number) => void;
  onClose: () => void;
}

export default function ReminderEditModal({
  visible,
  initialItem,
  onSave,
  onClose,
}: ReminderEditModalProps) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [hour, setHour] = useState(21);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (visible) {
      if (initialItem) {
        setTitle(initialItem.title);
        setHour(initialItem.hour);
        setMinute(initialItem.minute);
      } else {
        setTitle('リマインダー');
        setHour(20);
        setMinute(0);
      }
    }
  }, [visible, initialItem]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('入力エラー', 'リマインダーの名前を入力してください。');
      return;
    }
    onSave(trimmedTitle, hour, minute);
  };

  const adjustHour = (delta: number) => {
    setHour((prev) => (prev + delta + 24) % 24);
  };

  const adjustMinute = (delta: number) => {
    setMinute((prev) => (prev + delta + 60) % 60);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {initialItem ? 'リマインダーの編集' : 'リマインダーの追加'}
            </Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ラベル入力 */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              タイトル / ラベル
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="例: 朝の気分チェック"
              placeholderTextColor={colors.textLight}
              maxLength={25}
            />
          </View>

          {/* 時刻選択 */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>通知時刻</Text>

            <View style={styles.pickerRow}>
              {/* 時 (Hour) */}
              <View style={styles.pickerColumn}>
                <TouchableOpacity
                  style={[styles.arrowButton, { backgroundColor: colors.background }]}
                  onPress={() => adjustHour(1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-up" size={20} color={colors.textPrimary} />
                </TouchableOpacity>

                <Text style={[styles.pickerValue, { color: colors.textPrimary }]}>
                  {hour.toString().padStart(2, '0')}
                </Text>

                <TouchableOpacity
                  style={[styles.arrowButton, { backgroundColor: colors.background }]}
                  onPress={() => adjustHour(-1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.colon, { color: colors.textPrimary }]}>:</Text>

              {/* 分 (Minute) */}
              <View style={styles.pickerColumn}>
                <TouchableOpacity
                  style={[styles.arrowButton, { backgroundColor: colors.background }]}
                  onPress={() => adjustMinute(5)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-up" size={20} color={colors.textPrimary} />
                </TouchableOpacity>

                <Text style={[styles.pickerValue, { color: colors.textPrimary }]}>
                  {minute.toString().padStart(2, '0')}
                </Text>

                <TouchableOpacity
                  style={[styles.arrowButton, { backgroundColor: colors.background }]}
                  onPress={() => adjustMinute(-5)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ボタン */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: colors.textOnPrimary, fontWeight: '700' }]}>
                保存
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  input: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  arrowButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    width: 44,
    alignItems: 'center',
  },
  pickerValue: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 4,
  },
  colon: {
    fontSize: 28,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: FontSize.md,
  },
});
