# StrataQuest - CLAUDE.md

## プロジェクト概要

具体⇔抽象の往復トレーニングと英語語彙学習を融合させたRPG型Webアプリ。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + React 19
- **言語**: TypeScript 5.x
- **パッケージマネージャー**: npm
- **ORM**: Prisma 6 + Cloudflare D1 (SQLite互換)
- **スタイリング**: Tailwind CSS v4 + shadcn/ui
- **テスト**: Vitest (単体) + Playwright (E2E)
- **デプロイ**: Cloudflare Workers (opennextjs-cloudflare)

## ディレクトリ構成

```
app/              # Next.js App Router
  layout.tsx      # ルートレイアウト (export const runtime = "edge")
  page.tsx        # ホームページ
  generated/      # Prisma生成クライアント
components/
  ui/             # shadcn/ui コンポーネント
lib/
  db.ts           # Prismaクライアント (D1対応)
  utils.ts        # shadcn/ui ユーティリティ
prisma/
  schema.prisma   # Prismaスキーマ
test/             # Vitest ユニットテスト
e2e/              # Playwright E2Eテスト
```

## 主要コマンド

```bash
npm run dev           # 開発サーバー (Turbopack)
npm run build         # プロダクションビルド
npm run typecheck     # TypeScript型チェック
npm run lint          # ESLint
npm run test          # Vitestユニットテスト
npm run e2e           # Playwright E2Eテスト
npm run cf:build      # Cloudflare向けビルド
npm run preview       # ローカルCloudflareプレビュー
npm run deploy        # Cloudflareデプロイ
```

## 重要ルール

- `any`/`unknown` 型禁止
- TypeScript `class` は Error継承のカスタムエラーのみ許可
- Cloudflare Workers向けに `export const runtime = "edge"` を各 route/layout に追加
- Prisma D1アダプターは本番用、ローカル開発は通常のSQLiteを使用
- ドメインロジックはDB依存を持たない純粋関数として実装

## Cloudflare D1 セットアップ

```bash
# D1データベース作成（初回のみ）
npx wrangler d1 create strata-quest-db
# 出力されたdatabase_idをwrangler.tomlに設定

# マイグレーション実行
npx wrangler d1 migrations apply strata-quest-db
```

## shadcn/ui

Style: New York, Base color: Neutral, CSS variables: Yes
