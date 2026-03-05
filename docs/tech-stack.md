# 技術スタック

## 概要

StrataQuest は Next.js (App Router) をベースとし、Cloudflare Workers 上で動作する Web アプリケーションです。

---

## フロントエンド

### Next.js 16 (App Router)

- **バージョン**: 16.1.6
- App Router を採用し、Server Components / Client Components を使い分ける構成
- 各 layout / route には `export const runtime = "edge"` を付与（Cloudflare Workers 対応）
- ビルドツールに Turbopack を使用（`next dev` 時）

### React 19

- **バージョン**: 19.2.3
- Server Actions, use フック など React 19 の機能を活用

### TypeScript 5

- **バージョン**: ^5（strict モード有効）
- `any` / `unknown` 型の使用禁止
- `class` は `Error` 継承のカスタムエラーのみ許可
- パスエイリアス: `@/*` → プロジェクトルート

---

## スタイリング

### Tailwind CSS v4

- **バージョン**: ^4
- PostCSS プラグイン (`@tailwindcss/postcss`) 経由で処理
- アニメーション拡張: `tw-animate-css`

### shadcn/ui

- **スタイル**: New York
- **ベースカラー**: Neutral
- **CSS 変数**: 有効
- 依存ライブラリ:
  - `radix-ui` ^1.4.3 — アクセシブルなプリミティブ UI コンポーネント
  - `class-variance-authority` ^0.7.1 — バリアントベースのクラス管理
  - `clsx` ^2.1.1 — 条件付きクラス結合
  - `tailwind-merge` ^3.5.0 — Tailwind クラスの衝突解決
  - `lucide-react` ^0.577.0 — アイコンセット

---

## データベース / ORM

### Prisma 6

- **バージョン**: ^6.19.2
- スキーマ定義: `prisma/schema.prisma`
- 生成クライアント出力先: `app/generated/prisma`（`.gitignore` 対象）

### Cloudflare D1

- SQLite 互換のサーバーレス DB（Cloudflare Workers にバインド）
- Prisma D1 アダプター (`@prisma/adapter-d1` ^7.4.2) 経由で接続
- バインディング名: `DB`（`wrangler.toml` で定義）
- ローカル開発では通常の SQLite を使用

---

## デプロイ / インフラ

### Cloudflare Workers

- エッジランタイムとして動作
- `compatibility_date`: 2024-09-23
- `compatibility_flags`: `nodejs_compat`

### opennextjs-cloudflare

- **パッケージ**: `@opennextjs/cloudflare` ^1.7.0
- Next.js アプリを Cloudflare Workers 向けにビルドするアダプター
- ビルド出力: `.open-next/worker.js`（`.gitignore` 対象）
- 設定ファイル: `open-next.config.ts`

### Wrangler

- **バージョン**: ^4.70.0
- Cloudflare Workers のビルド・プレビュー・デプロイ CLI
- 設定ファイル: `wrangler.toml`

---

## テスト

### Vitest

- **バージョン**: ^4.0.18
- 単体テスト / コンポーネントテスト
- `jsdom` 環境でブラウザ API をエミュレート
- 関連ライブラリ:
  - `@testing-library/react` ^16.3.2
  - `@testing-library/user-event` ^14.6.1
  - `@testing-library/jest-dom` ^6.9.1
  - `@vitejs/plugin-react` ^4.7.0

### Playwright

- **バージョン**: ^1.58.2
- E2E テスト
- テストファイル配置先: `e2e/`

---

## リント

### ESLint 9

- **バージョン**: ^9
- `eslint-config-next` 16.1.6 をベース設定として使用

---

## 主要コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動（Turbopack） |
| `npm run build` | プロダクションビルド（Next.js） |
| `npm run typecheck` | TypeScript 型チェック（`tsc --noEmit`） |
| `npm run lint` | ESLint 実行 |
| `npm run test` | Vitest 単体テスト |
| `npm run e2e` | Playwright E2E テスト |
| `npm run cf:build` | Cloudflare 向けビルド（opennextjs） |
| `npm run preview` | Cloudflare ローカルプレビュー |
| `npm run deploy` | Cloudflare Workers へデプロイ |
