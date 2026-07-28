import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import { WeeklyReportData } from '../types';

interface WeeklyReportModalProps {
  visible: boolean;
  reportData: WeeklyReportData | null;
  onClose: () => void;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  visible,
  reportData,
  onClose,
}) => {
  const { colors } = useTheme();

  if (!visible || !reportData) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>今週の感情レポート</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={24} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.dateSub, { color: colors.textSecondary }]}>
            {reportData.startDate} 〜 {reportData.endDate}
          </Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* 記録日数カード */}
            <View style={[styles.statCard, { backgroundColor: `${colors.primary}15` }]}>
              <View style={styles.statIconBadge}>
                <Text style={styles.statIconEmoji}>📅</Text>
              </View>
              <View style={styles.statTextGroup}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  今週の記録日数
                </Text>
                <Text style={[styles.statValue, { color: colors.primaryDark }]}>
                  {reportData.recordedDaysCount} / 7 日間記録
                </Text>
              </View>
            </View>

            {/* 平均感情カード */}
            <View style={[styles.statCard, { backgroundColor: `${colors.secondary}15` }]}>
              <View style={styles.statIconBadge}>
                <Text style={styles.statIconEmoji}>{reportData.averageEmoji}</Text>
              </View>
              <View style={styles.statTextGroup}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  平均感情レベル
                </Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {reportData.averageLevel !== null
                    ? `${reportData.averageLevel} / 5.0`
                    : 'データなし'}
                </Text>
              </View>
            </View>

            {/* タグ分析 */}
            {reportData.topTags.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  🏷️ 今週よく感じた要因
                </Text>
                <View style={styles.tagRow}>
                  {reportData.topTags.map((tag) => (
                    <View
                      key={tag}
                      style={[styles.tagPill, { backgroundColor: `${colors.primary}20` }]}
                    >
                      <Text style={[styles.tagText, { color: colors.primaryDark }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 今週のメッセージ */}
            <View
              style={[
                styles.messageBox,
                { backgroundColor: `${colors.accent || colors.primary}15` },
              ]}
            >
              <Text style={styles.messageEmoji}>💌</Text>
              <Text style={[styles.messageText, { color: colors.textPrimary }]}>
                {reportData.message}
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>確認完了</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  dateSub: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
  },
  scrollArea: {
    marginBottom: Spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  statIconBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  statIconEmoji: {
    fontSize: 20,
  },
  statTextGroup: {
    flex: 1,
  },
  statLabel: {
    fontSize: FontSize.xs,
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginTop: 2,
  },
  section: {
    marginVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tagPill: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  messageEmoji: {
    fontSize: 24,
  },
  messageText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  confirmButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.md,
  },
});
