import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface SafetyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SafetyModal({ visible, onClose }: SafetyModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.icon}>🌿</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>ご利用の前に</Text>

            <Text style={[styles.body, { color: colors.textSecondary }]}>
              このアプリは日々の感情を記録し、セルフケアを支援するためのツールです。
            </Text>

            <View
              style={[
                styles.notice,
                { backgroundColor: colors.tagBg, borderLeftColor: colors.warning },
              ]}
            >
              <Text style={[styles.noticeTitle, { color: colors.textPrimary }]}>
                ⚠️ ご注意ください
              </Text>
              <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>
                本アプリは医療機関の診断・治療に代わるものではありません。{'\n\n'}
                心身の不調が強い場合は、専門医や相談機関をご利用ください。
              </Text>
            </View>

            <View style={[styles.helpSection, { backgroundColor: colors.background }]}>
              <Text style={[styles.helpTitle, { color: colors.textPrimary }]}>📞 相談窓口</Text>
              <Text style={[styles.helpItem, { color: colors.textSecondary }]}>
                • いのちの電話: 0120-783-556
              </Text>
              <Text style={[styles.helpItem, { color: colors.textSecondary }]}>
                • よりそいホットライン: 0120-279-338
              </Text>
              <Text style={[styles.helpItem, { color: colors.textSecondary }]}>
                • こころの健康相談統一ダイヤル: 0570-064-556
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.textOnPrimary }]}>
                同意して始める
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modal: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxHeight: '85%',
    ...Shadow.lg,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  notice: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
  },
  noticeTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  noticeBody: {
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
  helpSection: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  helpTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  helpItem: {
    fontSize: FontSize.sm,
    lineHeight: 24,
  },
  button: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
