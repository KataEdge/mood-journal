import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import { getAllTags, addCustomTag, deleteCustomTag } from '../utils/storage';
import { DEFAULT_PRESET_TAGS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface TagSelectorProps {
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onToggleTag,
}) => {
  const { colors } = useTheme();
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagText, setNewTagText] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const tags = await getAllTags();
    setAllTags(tags);
  };

  const handleAddTag = async () => {
    const trimmed = newTagText.trim();
    if (!trimmed) {
      setIsAdding(false);
      return;
    }
    if (allTags.includes(trimmed)) {
      Alert.alert('お知らせ', '同名のタグが既に存在します');
      return;
    }
    const updated = await addCustomTag(trimmed);
    setAllTags(updated);
    if (!selectedTags.includes(trimmed)) {
      onToggleTag(trimmed);
    }
    setNewTagText('');
    setIsAdding(false);
  };

  const handleDeleteCustomTag = (tagName: string) => {
    if (DEFAULT_PRESET_TAGS.includes(tagName)) return;

    Alert.alert(
      'タグの削除',
      `「${tagName}」タグを削除してもよろしいですか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteCustomTag(tagName);
            setAllTags(updated);
            if (selectedTags.includes(tagName)) {
              onToggleTag(tagName);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>要因・関連タグ (複数選択可)</Text>

      <View style={styles.tagWrap}>
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isCustom = !DEFAULT_PRESET_TAGS.includes(tag);

          return (
            <TouchableOpacity
              key={tag}
              style={[
                styles.chip,
                { backgroundColor: colors.tagBg },
                isSelected && { backgroundColor: colors.tagSelectedBg },
                isCustom && { borderWidth: 1, borderColor: colors.secondaryDark },
              ]}
              onPress={() => onToggleTag(tag)}
              onLongPress={() => isCustom && handleDeleteCustomTag(tag)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.tagText },
                  isSelected && { color: colors.tagSelectedText, fontWeight: '700' },
                ]}
              >
                {isSelected ? '✓ ' : ''}# {tag}
              </Text>
            </TouchableOpacity>
          );
        })}

        {!isAdding ? (
          <TouchableOpacity
            style={[styles.addChip, { borderColor: colors.primaryDark, backgroundColor: colors.surface }]}
            onPress={() => setIsAdding(true)}
          >
            <Text style={[styles.addChipText, { color: colors.primaryDark }]}>+ 新しいタグ</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="タグ名を入力..."
              placeholderTextColor={colors.textLight}
              value={newTagText}
              onChangeText={setNewTagText}
              autoFocus
              maxLength={15}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAddTag}>
              <Text style={[styles.addBtnText, { color: colors.textOnPrimary }]}>追加</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setNewTagText('');
                setIsAdding(false);
              }}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
  },
  chipText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '500',
  },
  addChip: {
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
  },
  addChipText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.xs + 1,
    minWidth: 100,
  },
  addBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.xs,
  },
  addBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingHorizontal: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  cancelBtnText: {
    fontSize: FontSize.sm,
  },
});

