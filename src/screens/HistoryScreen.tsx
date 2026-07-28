import React, { useState, useCallback } from 'react';
import { View, Text, SectionList, StyleSheet, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MoodCard from '../components/MoodCard';
import EditMoodModal from '../components/EditMoodModal';
import { ThemeHeader } from '../components/ThemeHeader';
import { MoodEntry } from '../types';
import { getMoodEntries, deleteMoodEntry, saveMoodEntry } from '../utils/storage';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface Section {
  title: string;
  data: MoodEntry[];
}

import { MoodCalendar } from '../components/MoodCalendar';
import { getLocalDateString } from '../utils/streak';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [allRawEntries, setAllRawEntries] = useState<MoodEntry[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadEntries = async () => {
    setLoading(true);
    const entries = await getMoodEntries();
    setAllRawEntries(entries);
    setLoading(false);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // 選択日または全データのグループ化セクション
  const activeEntries = React.useMemo(() => {
    if (!selectedDate) return allRawEntries;
    return allRawEntries.filter((entry) => getLocalDateString(entry.timestamp) === selectedDate);
  }, [allRawEntries, selectedDate]);

  const activeSections = React.useMemo(() => {
    const grouped = activeEntries.reduce<Record<string, MoodEntry[]>>((acc, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {});

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [activeEntries]);

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      loadEntries();
    }, [])
  );

  const handleDelete = async (id: string) => {
    await deleteMoodEntry(id);
    await loadEntries();
  };

  const handleEdit = (entry: MoodEntry) => {
    setEditingEntry(entry);
  };

  const handleSaveEdit = async (updatedEntry: MoodEntry) => {
    await saveMoodEntry(updatedEntry);
    setEditingEntry(null);
    await loadEntries();
  };

  const renderSectionHeader = ({ section }: { section: Section }) => {
    const moodEmojis: Record<number, string> = {
      1: '😢',
      2: '😔',
      3: '😐',
      4: '🙂',
      5: '😄',
    };
    const emojis = section.data.map((e) => moodEmojis[e.mood] || '😐').join(' ');

    return (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{section.title}</Text>
        <Text style={styles.sectionEmojis}>{emojis}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: MoodEntry }) => (
    <MoodCard entry={item} onDelete={handleDelete} onEdit={handleEdit} />
  );

  const renderHeader = () => (
    <View style={styles.headerComponentContainer}>
      <MoodCalendar
        entries={allRawEntries}
        selectedDate={selectedDate}
        onSelectDate={(dateStr) => setSelectedDate(dateStr)}
      />
      {selectedDate && (
        <View
          style={[
            styles.filterBanner,
            { backgroundColor: `${colors.primary}20`, borderColor: colors.primaryDark },
          ]}
        >
          <Text style={[styles.filterBannerText, { color: colors.textPrimary }]}>
            📅 {selectedDate}の記録 ({activeEntries.length}件)
          </Text>
          <TouchableOpacity
            style={styles.resetFilterButton}
            onPress={() => setSelectedDate(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.resetFilterText, { color: colors.primaryDark }]}>
              すべての記録を表示
            </Text>
            <Ionicons name="close-circle" size={16} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          {selectedDate ? `${selectedDate} の記録はありません` : 'まだ記録がありません'}
        </Text>
        <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
          {selectedDate
            ? '他の日付をタップするか、すべての記録を表示してください'
            : 'ホーム画面から今の気持ちを\n記録してみましょう'}
        </Text>
      </View>
    );
  };

  const totalEntries = allRawEntries.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemeHeader
          title="履歴 📖"
          subtitle={totalEntries > 0 ? `${totalEntries}件の記録` : undefined}
        />
      </View>

      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <SectionList
          sections={activeSections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      </Animated.View>

      {totalEntries > 0 && (
        <View style={[styles.hintContainer, { borderTopColor: colors.divider }]}>
          <Text style={[styles.hintText, { color: colors.textLight }]}>
            💡 カレンダーの日付タップで絞り込み／編集アイコンで記録の編集ができます
          </Text>
        </View>
      )}

      {/* 編集モーダル */}
      <EditMoodModal
        visible={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  headerComponentContainer: {
    paddingTop: Spacing.xs,
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  filterBannerText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  resetFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetFilterText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  sectionEmojis: {
    fontSize: FontSize.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyBody: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  hintContainer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  hintText: {
    fontSize: FontSize.xs,
  },
});
