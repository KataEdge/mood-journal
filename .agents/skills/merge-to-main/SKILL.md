---
name: merge-to-main
description: 現在の作業・新機能変更を型チェックで検証し、コミット・Pushしてmainブランチへ安全にマージする定型自動フロー
---

# 🔀 mainブランチへのマージ自動化スキル (Merge to Main Automation)

このスキルは、作業中・開発済みの変更を `npm run check` による品質検証の上でコミットし、`main` ブランチへ安全かつ確実にマージするための定型フローです。

---

## 📋 実行ステップ

### Step 1. ローカル型・品質検証
コミット・マージ前に必ず型チェックを実行し、エラーが 0 件であることを確認します。

```bash
npm run check
```

### Step 2. 変更のコミット
Conventional Commits スタイルに従い、現在の作業内容をコミットします。

```bash
git add .
git commit -m "feat: <機能追加・変更の簡潔な概要>"
```

### Step 3. main ブランチへのマージ

#### パターン A: 現在のブランチが `main` の場合
変更をコミット後、リモートへ Push します。
```bash
git push origin main
```

#### パターン B: トピックブランチ（例: `feat/...`）で作業中の場合
1. `main` ブランチへ切り替えて最新化します。
   ```bash
   git checkout main
   git pull origin main
   ```
2. 作業ブランチを `main` へマージします。
   ```bash
   git merge <topic-branch-name>
   ```
3. リモート `main` へ Push し、作業ブランチを削除します。
   ```bash
   git push origin main
   git branch -d <topic-branch-name>
   ```

#### パターン C: GitHub CLI (`gh`) を使用した PR 経由でのマージ
1. トピックブランチを Push して PR を作成します。
   ```bash
   git push -u origin <topic-branch-name>
   gh pr create --title "feat: <タイトル>" --body "## 概要\n- 変更内容\n\n## 検証\n- npm run check 成功"
   ```
2. PR をマージします。
   ```bash
   gh pr merge --squash --delete-branch
   ```

### Step 4. 完了状態の確認
ステータスおよびログを確認し、作業が正常に完了したことを確かめます。

```bash
git status
```
