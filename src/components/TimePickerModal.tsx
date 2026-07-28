import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';

interface TimePickerModalProps {
  visible: boolean;
  initialHour: number;
  initialMinute: number;
  onClose: () => void;
  onSave: (hour: number, minute: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45]; // 主要な15分刻み

export default function TimePickerModal({
  visible,
  initialHour,
  initialMinute,
  onClose,
  onSave,
}: TimePickerModalProps) {
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);

  useEffect(() => {
    if (visible) {
      setSelectedHour(initialHour);
      setSelectedMinute(initialMinute);
    }
  }, [visible, initialHour, initialMinute]);

  const handleSave = () => {
    onSave(selectedHour, selectedMinute);
    onClose();
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.title}>通知時刻の設定 ⏰</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-outline" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 選択プレビュー */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>
              {formatNumber(selectedHour)}:{formatNumber(selectedMinute)}
            </Text>
          </View>

          {/* 時間 & 分 セレクト */}
          <View style={styles.pickerRow}>
            {/* 時（Hour） */}
            <View style={styles.column}>
              <Text style={styles.columnLabel}>時 (0-23)</Text>
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.item,
                      selectedHour === h && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedHour(h)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedHour === h && styles.selectedItemText,
                      ]}
                    >
                      {formatNumber(h)}時
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 分（Minute） */}
            <View style={styles.column}>
              <Text style={styles.columnLabel}>分</Text>
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.item,
                      selectedMinute === m && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedMinute(m)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedMinute === m && styles.selectedItemText,
                      ]}
                    >
                      {formatNumber(m)}分
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 保存ボタン */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>決定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  previewContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  previewText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  pickerRow: {
    flexDirection: 'row',
    height: 180,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  scrollList: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
  },
  item: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.xs,
    marginVertical: 2,
  },
  selectedItem: {
    backgroundColor: Colors.primary,
  },
  itemText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedItemText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  cancelBtn: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  cancelBtnText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    ...Shadow.sm,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
