# 🌿 CONTRIBUTING.md — 開発・ブランチ戦略ガイド

本プロジェクトでは、開発の透明性・保守性・継続的インテグレーション（CI）を確保するため、**GitHub Flow** に基づくブランチ戦略を採用します。

---

## 🔀 1. ブランチ戦略 (GitHub Flow)

### メインブランチ
- **`main`**:
  - 常時デプロイ可能・型チェックが通る安定ブランチです。
  - 直接コミット（Direct Commit）は禁止とし、必ず Pull Request (PR) を経由してマージします。

### 作業用ブランチ (Feature / Fix / Chore)
開発を行う際は、目的ごとに `main` からブランチを作成します：

- `feature/<機能名>`: 新機能の追加 (例: `feature/analytics-chart`, `feature/dark-mode`)
- `fix/<修正内容>`: バグ修正 (例: `fix/storage-race-condition`)
- `chore/<作業内容>`: 依存関係更新・CI設定・ドキュメント作成 (例: `chore/github-actions-ci`)

---

## 📝 2. コミットメッセージ規約

分かりやすい履歴を保つため、**Conventional Commits** スタイルを推奨します。

フォーマット: `<type>: <summary>`

### 主な Type
- `feat`: 新機能の追加
- `fix`: バグ修正
- `docs`: ドキュメントのみの更新
- `style`: コードの意味に影響しないフォーマット変更
- `refactor`: リファクタリング
- `test`: テストコードの追加・修正
- `chore`: ビルドプロセスやツール・ライブラリの変更

### 例
```bash
feat: 気分選択コンポーネントにアニメーションを追加
fix: 履歴画面で削除確認ダイアログが表示されない不具合を修正
docs: GitHub Flow ブランチ戦略ガイドを追加
```

---

## 🔄 3. Pull Request (PR) ワークフロー

1. **ブランチを作成**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **変更・コミット**
   ローカルで変更を行い、適切な単位でコミットします。

3. **ローカル品質チェック**
   コミット前に必ず型チェックを通してください。
   ```bash
   npm run check
   ```

4. **Push & Pull Request 作成**
   ```bash
   git push origin feature/your-feature-name
   ```
   GitHub上で `main` ブランチに対して PR を作成します。

5. **CI 自動チェック**
   PR 作成時に GitHub Actions CI が自動発火し、型チェック (`npm run check`) が実行されます。CIがグリーン（緑）になったことを確認してからマージします。
