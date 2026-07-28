import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserProfile } from '../types';
import { FontSize, Spacing, BorderRadius, Shadow, AVATAR_PRESETS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface ProfileSetupModalProps {
  visible: boolean;
  initialProfile?: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  isInitialSetup?: boolean;
  onClose?: () => void;
}

const MAX_NICKNAME_LENGTH = 15;

export default function ProfileSetupModal({
  visible,
  initialProfile,
  onSave,
  isInitialSetup = false,
  onClose,
}: ProfileSetupModalProps) {
  const { colors } = useTheme();
  const [nickname, setNickname] = useState('');
  const [avatarType, setAvatarType] = useState<'emoji' | 'image'>('emoji');
  const [avatarValue, setAvatarValue] = useState('🐱');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (initialProfile) {
        setNickname(initialProfile.nickname);
        setAvatarType(initialProfile.avatarType);
        setAvatarValue(initialProfile.avatarValue);
      } else {
        setNickname('');
        setAvatarType('emoji');
        setAvatarValue('🐱');
      }
      setError(null);
    }
  }, [visible, initialProfile]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('権限が必要です', '写真を選択するにはライブラリへのアクセスを許可してください。');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarType('image');
        setAvatarValue(result.assets[0].uri);
      }
    } catch (e) {
      console.error('ImagePicker Error:', e);
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setAvatarType('emoji');
    setAvatarValue(emoji);
  };

  const handleSave = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('ニックネームを入力してください');
      return;
    }
    if (trimmed.length > MAX_NICKNAME_LENGTH) {
      setError(`ニックネームは${MAX_NICKNAME_LENGTH}文字以内で入力してください`);
      return;
    }

    onSave({
      nickname: trimmed,
      avatarType,
      avatarValue,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {isInitialSetup ? 'アカウント作成' : 'プロフィール編集'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isInitialSetup
                ? 'あなたのニックネームとアバターを設定しましょう。後からいつでも変更できます。'
                : 'ニックネームやアバターを変更できます。'}
            </Text>

            {/* アバタープレビュー */}
            <View style={styles.previewContainer}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.tagBg, borderColor: colors.primary }]}>
                {avatarType === 'image' ? (
                  <Image source={{ uri: avatarValue }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarEmoji}>{avatarValue}</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.imagePickButton, { backgroundColor: colors.secondary }]}
                activeOpacity={0.8}
                onPress={handlePickImage}
              >
                <Text style={[styles.imagePickButtonText, { color: colors.textOnPrimary }]}>
                  📷 写真から選ぶ
                </Text>
              </TouchableOpacity>
            </View>

            {/* プリセット絵文字選択 */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              アバター絵文字から選ぶ
            </Text>
            <View style={styles.emojiGrid}>
              {AVATAR_PRESETS.map((emoji) => {
                const isSelected = avatarType === 'emoji' && avatarValue === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiTile,
                      { backgroundColor: isSelected ? colors.tagSelectedBg : colors.background },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectEmoji(emoji)}
                  >
                    <Text style={styles.emojiTileText}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ニックネーム入力 */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              ニックネーム
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderColor: error ? colors.error : colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="例: たろう"
                placeholderTextColor={colors.textLight}
                value={nickname}
                onChangeText={(text) => {
                  setNickname(text);
                  if (error) setError(null);
                }}
                maxLength={MAX_NICKNAME_LENGTH}
              />
              <Text style={[styles.counter, { color: colors.textLight }]}>
                {nickname.length}/{MAX_NICKNAME_LENGTH}
              </Text>
            </View>

            {error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : null}

            {/* ボタンエリア */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={handleSave}
              >
                <Text style={[styles.saveButtonText, { color: colors.textOnPrimary }]}>
                  {isInitialSetup ? '保存してはじめる' : '保存する'}
                </Text>
              </TouchableOpacity>

              {!isInitialSetup && onClose ? (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={onClose}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    キャンセル
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxHeight: '90%',
    ...Shadow.lg,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  imagePickButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  imagePickButtonText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.lg,
    justifyContent: 'center',
  },
  emojiTile: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiTileText: {
    fontSize: 24,
  },
  inputWrapper: {
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
  },
  counter: {
    fontSize: FontSize.xs,
    textAlign: 'right',
    marginTop: 2,
  },
  errorText: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
  },
  buttonContainer: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  saveButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  cancelButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
