# 📐 アーキテクチャ仕様書 (Architecture Specification)

## 1. アプリ概要・技術スタック

感情日記（Mood Journal）は、パステルカラー調の柔らかなデザインと、端末ローカルで完結する安全なデータ管理を備えたセルフケアアプリです。

- **Framework**: React Native (Expo SDK 57)
- **Language**: TypeScript (Strict Mode)
- **Navigation**: React Navigation Bottom Tabs v7
- **Storage**: `@react-native-async-storage/async-storage`
- **UI/Styling**: React Native `StyleSheet`, `Animated API`, `@expo/vector-icons`

---

## 2. モジュールレイヤー構造

```
[ UI Layer (Screens & Components) ]
          ↓ (Event / State)
[ Data Layer (Storage & Utilities) ]
          ↓ (Persistence)
[ Native Storage (AsyncStorage) ]
```

### ① UI Layer
- **`src/screens/`**:
  - `HomeScreen`: 気分記録のプレゼンテーションと状態のハンドリング
  - `HistoryScreen`: 記録データのSectionList表示と個別・グループ化ロジック
  - `SafetyScreen`: 静的テキスト、電話リンク (Linking API) およびセルフケア情報の提示
- **`src/components/`**:
  - `MoodSelector`: 5段階気分のインタラクティブアニメーションコンポーネント
  - `MoodCard`: 履歴項目の個別表示カード
  - `SafetyModal`: 初回起動検知時にオーバーレイ表示されるモーダル

### ② Data Layer
- **`src/utils/storage.ts`**:
  - `saveMoodEntry(entry)`: 新規エントリの保存
  - `getMoodEntries()`: 全エントリの取得・降順ソート
  - `deleteMoodEntry(id)`: エントリの削除
  - `isFirstLaunch()` / `setFirstLaunchDone()`: 初回起動判定フラグの管理
- **`src/utils/messages.ts`**:
  - `getRandomMessage()`: ランダム励ましメッセージの抽出

### ③ Domain & Design Specs
- **`src/types/index.ts`**: `MoodEntry`, `MoodLevel`, `MoodOption` 等の全型定義
- **`src/constants/theme.ts`**: `Colors`, `FontSize`, `Spacing`, `BorderRadius`, `Shadow`, `MOOD_OPTIONS`

---

## 3. データモデル仕様

### MoodEntry
```typescript
export interface MoodEntry {
  id: string;        // タイムスタンプ + ランダム文字列
  mood: MoodLevel;   // 1 (とても良い) 〜 5 (辛い)
  note: string;      // 任意の一言メモ (最大200文字)
  timestamp: string; // ISO 8601 形式文字列
}
```

---

## 4. UI/UX ガイドライン

- **カラーシステム**:
  - Primary: `#A8D8EA` (ペールブルー)
  - Secondary: `#AA96DA` (ラベンダー)
  - Accent: `#FCBAD3` (ソフトピンク)
  - Background: `#F8F9FE` (オフホワイト)
- **アクセシビリティ & フィードバック**:
  - タップ・選択時には `Animated.spring` を用いたインタラクティブなレスポンスを提供。
  - 文字入力を必須とせず、絵文字タップのみで完了できる低ストレス設計。
