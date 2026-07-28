import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { AchievementBadge } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';

interface BadgeUnlockedModalProps {
  visible: boolean;
  onClose: () => void;
  unlockedBadge: AchievementBadge | null;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({
  visible,
  onClose,
  unlockedBadge,
}) => {
  const { colors } = useTheme();

  if (!unlockedBadge) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={styles.partyEmoji}>🎉</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            新しいアチーブメント獲得！
          </Text>

          <View
            style={[
              styles.badgeContainer,
              { backgroundColor: `${colors.primary}25` },
            ]}
          >
            <Text style={styles.badgeIcon}>{unlockedBadge.icon}</Text>
          </View>

          <Text style={[styles.badgeTitle, { color: colors.textPrimary }]}>
            {unlockedBadge.title}
          </Text>
          <Text style={[styles.badgeDescription, { color: colors.textSecondary }]}>
            {unlockedBadge.description}
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primaryDark }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.textOnPrimary }]}>
              やったね！
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  partyEmoji: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  badgeContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeIcon: {
    fontSize: 36,
  },
  badgeTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    width: '100%',
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
