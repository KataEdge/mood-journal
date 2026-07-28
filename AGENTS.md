# 🤖 AGENTS.md — AI Agent & Harness Engineering Guide

このファイルは、AIエージェントおよび開発者が「感情日記（Mood Journal）」のコードベースを正確・安全に理解し、変更・テスト・拡張を行うためのハーネス（コンテキストインデックス）ガイドです。

---

## 📌 1. プロジェクト概要

- **名称**: 感情日記 (Mood Journal)
- **目的**: ユーザーの毎日の気分・感情を記録し、ポジティブメッセージとセルフケアガイドでメンタルヘルスを支援するクロスプラットフォーム（iOS / Android / Web）MVPアプリ。
- **データ保存**: `@react-native-async-storage/async-storage` を用いた端末ローカル完結保存（サーバー通信なし・プライバシー重視）。

---

## 📂 2. コードベース・インデックス

プロジェクトのディレクトリ構造と各モジュールの単一責任:

```
mood-journal/
├── App.tsx                    # アプリのエントリポイント（Navigation Container, Bottom Tabs）
├── package.json               # 依存関係およびスクリプト
├── tsconfig.json              # TypeScript設定
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI パイプライン
├── docs/
│   └── architecture.md        # 詳細アーキテクチャ・設計仕様
├── src/
│   ├── types/
│   │   └── index.ts           # MoodEntry, MoodLevel, MoodOption 等の全データ型定義
│   ├── constants/
│   │   └── theme.ts           # 共通カラーパレット (Colors), スペーシング, 気分選択肢 (MOOD_OPTIONS)
│   ├── utils/
│   │   ├── storage.ts         # AsyncStorage CRUD 操作および初回起動フラグ関数
│   │   └── messages.ts        # ポジティブメッセージのランダム取得ロジック
│   ├── components/
│   │   ├── MoodSelector.tsx   # 5段階の気分絵文字選択コンポーネント (Animated API)
│   │   ├── MoodCard.tsx       # 過去エントリ表示カード (長押し削除)
│   │   └── SafetyModal.tsx    # 初回起動時に自動表示される免責事項モーダル
│   └── screens/
│       ├── HomeScreen.tsx     # 感情記録画面 (メッセージ, 選択器, メモ, 保存)
│       ├── HistoryScreen.tsx  # 履歴画面 (SectionList による日付別グループ化)
│       └── SafetyScreen.tsx   # 免責事項・相談窓口・セルフケアヒント画面
```

---

## ⚙️ 3. ハーネスコマンド (検証・ビルド)

AIエージェントまたは開発者は、コード変更後に必ず以下のコマンドで検証を行ってください：

| 目的 | コマンド | 説明 |
|---|---|---|
| **型チェック** | `npm run type-check` | TypeScript の静的型チェック (`tsc --noEmit`) |
| **総合検証** | `npm run check` | CIで使用される総合検証コマンド |
| **開発サーバー** | `npm run start` | Expo Dev Server の起動 |
| **Web確認** | `npm run web` | Webブラウザでのローカル動作確認 |

---

## 🛡️ 4. 開発・コード変更ルール (Safety Rules)

1. **型安全性の維持**:
   - `any` 型の使用は禁止です。データ構造の追加・変更は必ず [src/types/index.ts](src/types/index.ts) に型を定義してください。
2. **デザインシステム・テーマの遵守**:
   - ハードコードされた色コードの使用は避け、[src/constants/theme.ts](src/constants/theme.ts) の `Colors`, `FontSize`, `Spacing`, `BorderRadius` を使用してください。
3. **ローカルファーストの徹底**:
   - 外部サーバー通信を追加せず、データは [src/utils/storage.ts](src/utils/storage.ts) 経由で AsyncStorage にローカル保存してください。
4. **検証の義務**:
   - コミットやPR作成前には必ず `npm run check` を実行し、型エラーが 0 件であることを確認してください。

---

## ⚡ 5. トークン最適化ガイドライン (Token Optimization Rules)

AIエージェントは応答効率化とコンテキスト消費最小化のため、以下を徹底してください：

1. **要点優先の簡潔な応答**:
   - 挨拶・過度な前置き・冗長な解説を避け、変更理由・変更点・検証結果のみを短く簡潔に回答する。
2. **差分編集（Diff-Only）の徹底**:
   - ファイル全体の再出力や重複したコードの貼り付けを行わず、変更箇所のみを最小限編集する。
3. **ターゲットを絞ったファイル閲覧**:
   - 不要なファイルを一括で読み込まず、必要なモジュールのみピンポイントで閲覧・検索する。
4. **定型タスクのスキル活用**:
   - 定型タスク（バグ修正・PR作成等）は `.agents/skills/` 内のスキル手順に従い最短手順で実行する。

---

## 🔗 6. ドキュメント参照

- **ブランチ戦略・コミット規約**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **詳細アーキテクチャドキュメント**: [docs/architecture.md](docs/architecture.md)
