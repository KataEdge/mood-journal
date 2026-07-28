import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import { ThemeType, UserProfile } from '../types';

interface ThemeHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  userProfile?: UserProfile | null;
  onPressProfile?: () => void;
}

export const ThemeHeader: React.FC<ThemeHeaderProps> = ({
  title,
  subtitle,
  rightElement,
  userProfile,
  onPressProfile,
}) => {
  const { theme, colors, cycleTheme } = useTheme();

  const getThemeBadge = (t: ThemeType) => {
    switch (t) {
      case 'dark':
        return { icon: 'moon', label: 'ダーク', color: '#887BB0' };
      case 'warm':
        return { icon: 'sunny', label: 'ウォーム', color: '#F4A261' };
      case 'light':
      default:
        return { icon: 'sparkles', label: 'ノーマル', color: '#7EC8D9' };
    }
  };

  const badge = getThemeBadge(theme);
  const displayTitle = userProfile ? `こんにちは、${userProfile.nickname}さん 👋` : title;

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {userProfile ? (
          <TouchableOpacity
            style={[styles.avatarButton, { backgroundColor: colors.tagBg, borderColor: colors.primary }]}
            onPress={onPressProfile}
            activeOpacity={0.8}
            accessibilityLabel="プロフィール編集"
          >
            {userProfile.avatarType === 'image' ? (
              <Image source={{ uri: userProfile.avatarValue }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>{userProfile.avatarValue}</Text>
            )}
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {displayTitle}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        {rightElement}
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          onPress={cycleTheme}
          activeOpacity={0.7}
          accessibilityLabel="テーマ切り替え"
        >
          <Ionicons name={badge.icon as any} size={16} color={badge.color} />
          <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>{badge.label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
    gap: Spacing.sm,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: FontSize.xs + 1,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  themeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

