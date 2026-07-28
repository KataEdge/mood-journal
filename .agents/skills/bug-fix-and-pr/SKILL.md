---
name: bug-fix-and-pr
description: バグ報告を受けた際に、fix/ブランチ作成、修正、型検証、コミット、Push、PR作成を一括で行う自動定型フロー
---

# 🐛 バグ修正 & PR作成スキル (Bug Fix & Pull Request Automation)

このスキルは、ユーザーからバグ報告または修正依頼を受けた際に、最短トークン・最高精度でブランチ作成からPR公開までを完結させる標準自動化タスクです。

---

## 📋 実行ステップ

### Step 1. 作業ブランチの作成
バグの概要を短く英単語でまとめたトピックブランチを作成・切り替えます。

```bash
git checkout -b fix/<short-bug-description>
```

### Step 2. 最小範囲の調査・修正
- エラーに関連するファイルのみをピンポイントで調査・参照します。
- `any` 型を使用せず、[src/types/index.ts](src/types/index.ts) および [src/constants/theme.ts](src/constants/theme.ts) を順守して修正します。

### Step 3. ローカル型・品質検証
修正完了後、必ず以下を実行して型エラーが 0 件であることを確認します。

```bash
npm run check
```

### Step 4. コミット & Push
Conventional Commits スタイルに従い、コミットおよび Push を行います。

```bash
git add .
git commit -m "fix: <バグ修正の簡潔な概要>"
git push -u origin fix/<short-bug-description>
```

### Step 5. Pull Request (PR) の作成
GitHub CLI を使用して `main` ブランチに対する PR を自動生成します（GitHub未認証の場合はPR作成URLを提示）。

```bash
gh pr create --title "fix: <概要>" --body "## 概要\n- 修正内容の要約\n\n## 検証\n- npm run check 実行済み"
```
