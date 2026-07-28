import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MoodCard from '../components/MoodCard';
import { MoodEntry } from '../types';
import { getMoodEntries, deleteMoodEntry } from '../utils/storage';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
} from '../constants/theme';

interface Section {
  title: string;
  data: MoodEntry[];
}

export default function HistoryScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadEntries = async () => {
    setLoading(true);
    const entries = await getMoodEntries();

    // 日付ごとにグループ化
    const grouped = entries.reduce<Record<string, MoodEntry[]>>((acc, entry) => {
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

    const sectionData: Section[] = Object.entries(grouped).map(
      ([title, data]) => ({ title, data })
    );

    setSections(sectionData);
    setLoading(false);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

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

  const renderSectionHeader = ({ section }: { section: Section }) => {
    // セクションの気分サマリーを表示
    const moodEmojis: Record<number, string> = {
      1: '😄', 2: '🙂', 3: '😐', 4: '😔', 5: '😢',
    };
    const emojis = section.data.map((e) => moodEmojis[e.mood] || '😐').join(' ');

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionEmojis}>{emojis}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: MoodEntry }) => (
    <MoodCard entry={item} onDelete={handleDelete} />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>まだ記録がありません</Text>
        <Text style={styles.emptyBody}>
          ホーム画面から今の気持ちを{'\n'}記録してみましょう
        </Text>
      </View>
    );
  };

  const totalEntries = sections.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>きろく 📖</Text>
        {totalEntries > 0 && (
          <Text style={styles.headerSubtitle}>
            {totalEntries}件の記録
          </Text>
        )}
      </View>

      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      </Animated.View>

      {totalEntries > 0 && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>💡 長押しで記録を削除できます</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
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
    color: Colors.textPrimary,
  },
  sectionEmojis: {
    fontSize: FontSize.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyBody: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  hintContainer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  hintText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
});
