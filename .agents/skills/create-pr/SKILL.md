---
name: create-pr
description: 現在の作業・変更を型チェックで検証し、コミット・Pushしてmainブランチ宛てのPull Request (PR) を作成する定型自動フロー
---

# 🔀 Pull Request (PR) 作成自動化スキル (Create PR Automation)

このスキルは、作業中・開発済みの変更を `npm run check` による品質検証の上でコミットし、`main` ブランチ宛ての Pull Request (PR) を作成・公開するための定型フローです。

---

## 📋 実行ステップ

### Step 1. ローカル型・品質検証
コミット・PR作成前に必ず型チェックを実行し、エラーが 0 件であることを確認します。

```bash
npm run check
```

### Step 2. 作業ブランチの確認・準備
現在 `main` ブランチにいる場合は、適切なトピックブランチを作成して切り替えます。すでにトピックブランチで作業している場合はそのブランチのまま進行します。

```bash
# 現在 main にいる場合
git checkout -b feature/<short-feature-description>
```

### Step 3. 変更のコミット & Push
Conventional Commits スタイルに従い変更をコミットし、リモートへ Push します。

```bash
git add .
git commit -m "feat: <機能追加・変更の簡潔な概要>"
git push -u origin <topic-branch-name>
```

### Step 4. Pull Request (PR) の作成
GitHub CLI (`gh`) を使用して `main` ブランチに対する PR を作成します。

```bash
gh pr create --title "feat: <タイトル>" --body "## 概要\n- 変更内容の要約\n\n## 検証\n- npm run check 実行済み"
```

※ GitHub CLI が未認証または未設定の場合は、Push 時に出力される Web 上の PR 作成 URL をユーザーへ提示します。

### Step 5. 完了状態の確認・URL共有
生成された PR の URL およびリポジトリのステータスを確認し、ユーザーへ報告します。

```bash
git status
```
