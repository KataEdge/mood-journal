import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { getAllTags, addCustomTag, deleteCustomTag } from '../utils/storage';
import { DEFAULT_PRESET_TAGS } from '../constants/theme';

interface TagSelectorProps {
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onToggleTag,
}) => {
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
      <Text style={styles.label}>要因・関連タグ (複数選択可)</Text>

      <View style={styles.tagWrap}>
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isCustom = !DEFAULT_PRESET_TAGS.includes(tag);

          return (
            <TouchableOpacity
              key={tag}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                isCustom && styles.customChipBorder,
              ]}
              onPress={() => onToggleTag(tag)}
              onLongPress={() => isCustom && handleDeleteCustomTag(tag)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {isSelected ? '✓ ' : ''}# {tag}
              </Text>
            </TouchableOpacity>
          );
        })}

        {!isAdding ? (
          <TouchableOpacity
            style={styles.addChip}
            onPress={() => setIsAdding(true)}
          >
            <Text style={styles.addChipText}>+ 新しいタグ</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="タグ名を入力..."
              placeholderTextColor={Colors.textLight}
              value={newTagText}
              onChangeText={setNewTagText}
              autoFocus
              maxLength={15}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddTag}>
              <Text style={styles.addBtnText}>追加</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setNewTagText('');
                setIsAdding(false);
              }}
            >
              <Text style={styles.cancelBtnText}>✕</Text>
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
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: Colors.tagBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
  },
  customChipBorder: {
    borderWidth: 1,
    borderColor: Colors.secondaryDark,
  },
  chipSelected: {
    backgroundColor: Colors.tagSelectedBg,
  },
  chipText: {
    fontSize: FontSize.xs + 1,
    color: Colors.tagText,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.tagSelectedText,
    fontWeight: '700',
  },
  addChip: {
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    borderStyle: 'dashed',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  addChipText: {
    fontSize: FontSize.xs + 1,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    minWidth: 100,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.xs,
  },
  addBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingHorizontal: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
});
