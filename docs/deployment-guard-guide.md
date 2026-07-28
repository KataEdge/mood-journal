# 🛡️ Vercel デプロイガード＆GitHubブランチ保護 設定ガイド

本ガイドでは、**「CIチェックが失敗したコードが誤ってVercelへデプロイされるのを防ぐ」**ための2つの保護設定手順をまとめています。

---

## 1. 🔒 GitHub ブランチ保護ルール (Branch Protection Rule) の設定

`main` ブランチへ直接Pushされるのを防ぎ、GitHub Actions CI（`CI Quality Check`）がPassしたPRのみマージ可能にします。

### 設定手順
1. GitHub上のリポジトリを開き、**[Settings]** タブを選択
2. 左メニューの **[Branches]** をクリック
3. **[Add branch protection rule]** ボタンをクリック
4. **Branch name pattern** に `main` を入力
5. 以下のチェックボックスをオンにする：
   - ▫️ **Require a pull request before merging**（マージ前にPRを必須化）
   - ▫️ **Require status checks to pass before merging**（CIチェックPassを必須化）
     - 検索窓に `Code Quality & Build Check` を入力して選択
6. 下部の **[Create]** ボタンをクリックして保存

---

## 2. ⚡ Vercel Ignored Build Step (CI合格時のみビルド実行)

Vercel側で「GitHub Actions CIの合否を確認し、CIがPassした場合のみVercelでビルド・デプロイを行う」コマンドを設定します。

### 設定手順
1. Vercelダッシュボード（[vercel.com](https://vercel.com)）で対象プロジェクトを開く
2. **[Settings]** ➔ **[Git]** タブを開く
3. **[Ignored Build Step]** セクションを探す
4. **Behavior** で `Command` を選択し、以下のコマンドを入力する：
   ```bash
   npx vercel-action-ignored-build
   ```
   または、GitHub API連携でチェックステータスを確認するカスタムコマンドを登録します。
5. **[Save]** をクリックして保存

---

## 🔑 モバイル自動ビルド用 Secret 設定 (EAS Build)

[.github/workflows/eas-build.yml](file:///.github/workflows/eas-build.yml) で自動ビルドを実行するために必要な設定です。

1. [expo.dev](https://expo.dev) のアカウント設定から **Access Token** を作成
2. GitHubリポジトリの **[Settings]** ➔ **[Secrets and variables]** ➔ **[Actions]** を選択
3. **[New repository secret]** をクリック
   - **Name**: `EXPO_TOKEN`
   - **Secret**: 作成したExpo Access Tokenを貼り付け
