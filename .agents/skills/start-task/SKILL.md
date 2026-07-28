---
name: start-task
description: 新しいタスク（機能追加・バグ修正・リファクタリング）の開始時に、mainから安全にトピックブランチを作成して作業を開始する定型フロー
---

# 🚀 タスク開始＆トピックブランチ作成スキル (Start Task Automation)

新機能開発・バグ修正・リファクタリング等のタスクを開始する際、`main` ブランチに直接変更を加えないよう、目的別のトピックブランチを自動作成して安全に開発をスタートする定型フローです。

---

## 📋 実行ステップ

### Step 1. ローカル作業ツリーの確認
未コミットの作業が残っていないか確認します。

```bash
git status
```

※ 未コミットの変更がある場合は、スタッシュ保存 (`git stash`) または現在の作業を完了させてから進行します。

### Step 2. main ブランチの最新化
`main` ブランチに切り替え、リモートの最新変更を取り込みます。

```bash
git checkout main
git pull origin main
```

### Step 3. トピックブランチの作成・切り替え
タスクの目的に応じたプレフィックスを付けて、新しい作業ブランチを作成します。

- **新機能の追加**: `feature/<機能名>`
  - 例: `git checkout -b feature/analytics-chart`
- **バグ・不具合修正**: `fix/<修正内容>`
  - 例: `git checkout -b fix/storage-null-handling`
- **ドキュメント・CI・メンテナンス**: `chore/<作業内容>`
  - 例: `git checkout -b chore/update-dependencies`

```bash
git checkout -b <branch-prefix>/<task-name>
```

### Step 4. ブランチ切替の完了確認
正常に新ブランチへ切り替わったことを確認し、開発作業を開始します。

```bash
git status
```
