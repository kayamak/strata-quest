# StrataQuest

具体⇔抽象の往復トレーニングと英語語彙学習を融合させた RPG 型 Web アプリ。

**本番 URL**: https://strata-quest.kayama-keiichi.workers.dev

## 技術スタック

- **ランタイム**: Cloudflare Workers (V8 Isolate)
- **フレームワーク**: Next.js 16 (App Router) + React 19
- **言語**: TypeScript 5（strict）
- **DB**: Cloudflare D1 (SQLite 互換) + Prisma 6
- **スタイリング**: Tailwind CSS v4 + shadcn/ui
- **テスト**: Vitest + Playwright
- **デプロイ**: opennextjs-cloudflare + Wrangler

詳細は [`docs/tech-stack.md`](docs/tech-stack.md) を参照してください。

## 前提条件

- Node.js 20+
- npm 10+
- Cloudflare アカウント（デプロイ時）

## セットアップ

```bash
# 依存関係のインストール
npm install

# Prisma クライアント生成
npx prisma generate
```

## 開発

```bash
# Next.js 開発サーバー（HMR あり、Node.js ランタイム）
npm run dev
```

`http://localhost:3000` で確認できます。

> **注意**: `npm run dev` は Node.js ランタイムで動作するため、Cloudflare Workers 固有の挙動は再現しません。
> Workers ランタイムに近い動作確認は `npm run preview` を使用してください。

```bash
# Cloudflare Workers ランタイムでのローカルプレビュー
npm run preview
```

## コマンド一覧

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動（Node.js + Turbopack） |
| `npm run build` | Next.js プロダクションビルド |
| `npm run cf:build` | Cloudflare Workers 向けビルド（opennextjs） |
| `npm run preview` | Cloudflare ローカルプレビュー（Workers ランタイム） |
| `npm run deploy` | Cloudflare Workers へデプロイ |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run lint` | ESLint 実行 |
| `npm run db:seed` | ローカル DB にシードデータ投入 |
| `npm run test` | Vitest 単体テスト |
| `npm run test:ui` | Vitest UI モード |
| `npm run test:coverage` | カバレッジレポート生成 |
| `npm run e2e` | Playwright E2E テスト |

## データベース

### ローカル（開発）

`npm run dev` 時はローカルの SQLite を Prisma 標準クライアントで使用します。

```bash
# マイグレーション実行
npx prisma migrate dev

# シードデータ投入（VocabularyNode・Quest・Question など）
npm run db:seed

# Prisma Studio（GUI）
npx prisma studio
```

> **シードの内容**: `prisma/seeds/seed.ts` を実行します。既存データを全削除した後、英語語彙ノード（32語）とクエスト（13種）を投入します。

### Cloudflare D1（本番・プレビュー）

```bash
# D1 データベース作成（初回のみ）
npx wrangler d1 create strata-quest-db
# → 出力された database_id を wrangler.toml の database_id に設定

# マイグレーションを D1 に適用（本番）
npx wrangler d1 migrations apply strata-quest-db

# マイグレーションをローカル D1 エミュレータに適用（preview 用）
npx wrangler d1 migrations apply strata-quest-db --local
```

## デプロイ

| 項目 | 値 |
|---|---|
| 本番 URL | https://strata-quest.kayama-keiichi.workers.dev |
| Cloudflare Worker 名 | `strata-quest` |
| D1 データベース名 | `strata-quest-db` |

```bash
# ビルド + デプロイ（1 コマンド）
npm run deploy

# または個別に実行
npm run cf:build
npx wrangler deploy
```

## ディレクトリ構成

```
app/                  # Next.js App Router
  layout.tsx          # ルートレイアウト
  page.tsx            # ホームページ
  generated/prisma/   # Prisma 生成クライアント（.gitignore 対象）
components/
  ui/                 # shadcn/ui コンポーネント
lib/
  db.ts               # Prisma クライアント（D1 アダプター対応）
  utils.ts            # shadcn/ui ユーティリティ
prisma/
  schema.prisma       # スキーマ定義
test/                 # Vitest 単体テスト
e2e/                  # Playwright E2E テスト
docs/                 # 設計・技術ドキュメント
```

## 開発ガイドライン

- `any` / `unknown` 型の使用禁止
- `class` は `Error` 継承のカスタムエラーのみ許可
- 各 `layout.tsx` / `page.tsx` / `route.ts` に `export const runtime = "edge"` を付与すること
- ドメインロジックは `lib/domain/` に純粋関数として実装し、DB 依存を持たせない
- Server Action では必ず認証チェックを先頭に実施すること
