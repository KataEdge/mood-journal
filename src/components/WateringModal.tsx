import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import { MindTreeInfo } from '../types';

interface WateringModalProps {
  visible: boolean;
  xpGained: number;
  treeInfo: MindTreeInfo | null;
  onClose: () => void;
}

export const WateringModal: React.FC<WateringModalProps> = ({
  visible,
  xpGained,
  treeInfo,
  onClose,
}) => {
  const { colors } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);
      bounceAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -8,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }
  }, [visible, scaleAnim, opacityAnim, bounceAnim]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconWrapper,
              { backgroundColor: `${colors.primary}20`, transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <Text style={styles.waterEmoji}>{treeInfo?.emoji || '🌱'}</Text>
          </Animated.View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            水やり完了！
          </Text>

          <View style={[styles.xpBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.xpBadgeText}>+{xpGained} XP 獲得！</Text>
          </View>

          {treeInfo && (
            <Text style={[styles.stageText, { color: colors.primaryDark }]}>
              {treeInfo.stageName} (Lv.{treeInfo.level})
            </Text>
          )}

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            今日も大切な心の状態を記録できました。ココロの木が元気に育っています🌱
          </Text>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>ありがとう！</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '90%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  waterEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: FontSize.lg + 2,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  xpBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
  },
  xpBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  stageText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  closeButton: {
    width: '100%',
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.md,
  },
});
