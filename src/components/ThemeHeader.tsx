import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import { ThemeType } from '../types';

interface ThemeHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const ThemeHeader: React.FC<ThemeHeaderProps> = ({ title, subtitle, rightElement }) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
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
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: FontSize.sm,
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
