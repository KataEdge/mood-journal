import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme';

interface SafetyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SafetyModal({ visible, onClose }: SafetyModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.icon}>🌿</Text>
            <Text style={styles.title}>ご利用の前に</Text>

            <Text style={styles.body}>
              このアプリは日々の感情を記録し、セルフケアを支援するためのツールです。
            </Text>

            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>⚠️ ご注意ください</Text>
              <Text style={styles.noticeBody}>
                本アプリは医療機関の診断・治療に代わるものではありません。{'\n\n'}
                心身の不調が強い場合は、専門医や相談機関をご利用ください。
              </Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>📞 相談窓口</Text>
              <Text style={styles.helpItem}>
                • いのちの電話: 0120-783-556
              </Text>
              <Text style={styles.helpItem}>
                • よりそいホットライン: 0120-279-338
              </Text>
              <Text style={styles.helpItem}>
                • こころの健康相談統一ダイヤル: 0570-064-556
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>同意して始める</Text>
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
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  body: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  notice: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  noticeTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  noticeBody: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  helpSection: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  helpTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  helpItem: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
