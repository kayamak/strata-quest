# 技術スタック

## 概要

StrataQuest は Next.js (App Router) をベースとし、Cloudflare Workers 上で動作する Web アプリケーションです。
インフラをすべて Cloudflare のエコシステムで統一することで、**ゼロコールドスタート・グローバル低レイテンシ・運用コスト最小化**を同時に実現しています。

---

## Cloudflare Workers — 採用理由と制約

### なぜ Cloudflare Workers を選んだか

| 比較軸 | Cloudflare Workers | Vercel / AWS Lambda |
|---|---|---|
| コールドスタート | なし（V8 Isolate） | 数百 ms〜数秒 |
| 無料枠 | 10万 req/日 | リクエスト数 + 実行時間で課金 |
| DB | D1（エッジ近傍） | RDS / PlanetScale（別リージョン） |
| グローバル配信 | 300+ PoP に自動分散 | リージョン指定が必要 |

RPG 型学習アプリとして「クエスト回答→即時フィードバック」のインタラクションが多く、レイテンシに敏感です。
Cloudflare Workers は V8 Isolate を使いコールドスタートがなく、D1 も同じ PoP 内に配置されるため、エンドツーエンドの遅延を最小化できます。
また個人開発の初期フェーズでは無料枠で十分まかなえるコスト構造も重要な理由です。

### Workers ランタイムの制約

Cloudflare Workers は Node.js ではなく **V8 Isolate** 上で動作します。これにより以下の制約があります。

- Node.js 組み込みモジュール（`fs`, `net`, `child_process` 等）は原則使用不可
  - `wrangler.toml` の `compatibility_flags = ["nodejs_compat"]` で一部の Node.js API（`Buffer`, `crypto` 等）を polyfill として有効化しています
  - `open-next.config.ts` の `edgeExternals: ["node:crypto"]` は crypto モジュールを Workers のネイティブ実装に委譲するための設定です
- 1 リクエストあたりの CPU 時間に上限あり（無料: 10ms、有料: 30s）
- WebSocket / TCP ソケットは制限付きサポート

---

## Next.js — Cloudflare Workers 上での使い方

### なぜ Next.js を選んだか

Cloudflare Workers での開発には Hono や itty-router などの軽量フレームワークも選択肢ですが、Next.js を選んだ理由は以下のとおりです。

- **App Router の Server Components** により、データ取得とレンダリングをサーバー側で完結させ、クライアントへの JS 送信量を最小化できる
- **Server Actions** により、API Route を別途定義せずにフォーム送信やミューテーションを型安全に実装できる
- shadcn/ui や Tailwind CSS との相性が良く、RPG UI の実装に必要なコンポーネントを素早く揃えられる
- Vercel 以外でのデプロイ実績が opennextjs により確立されてきており、ベンダーロックインを避けられる

### `export const runtime = "edge"` の全面適用

**これは Next.js の標準的な使い方ではありません。** 通常、Next.js の Server Components は Node.js ランタイム（`runtime = "nodejs"`）で動作します。

Cloudflare Workers は Node.js ランタイムをサポートしていないため、**すべての `layout.tsx` / `page.tsx` / `route.ts` に `export const runtime = "edge"` を宣言する**必要があります。

```ts
// app/layout.tsx
export const runtime = "edge";
```

`"edge"` ランタイムは Next.js の Web Standards API サブセット（`fetch`, `Request`, `Response`, `crypto` 等）のみを使う軽量モードです。
Node.js 専用パッケージ（`fs`, `net` 依存のライブラリ等）は使用できないため、依存ライブラリ選定時に常に確認が必要です。

### opennextjs-cloudflare によるビルド変換

Next.js は Vercel 向けのビルド出力を前提としており、そのままでは Cloudflare Workers にデプロイできません。
`@opennextjs/cloudflare` がビルド出力を Workers 用の単一 Worker スクリプトに変換します。

```
npm run build (next build)
    ↓
opennextjs-cloudflare build
    ↓
.open-next/worker.js  ← wrangler が Workers にデプロイ
```

`open-next.config.ts` の各設定の意味は以下のとおりです。

```ts
{
  wrapper: "cloudflare-node",   // Workers の fetch イベントハンドラとして動作させる
  converter: "edge",            // Next.js の edge runtime 形式に変換
  proxyExternalRequest: "fetch", // 外部リクエストを Workers の fetch API 経由に統一
  incrementalCache: "dummy",    // ISR キャッシュ無効（Workers では使用不可）
  tagCache: "dummy",            // タグベースキャッシュ無効（同上）
  queue: "dummy",               // バックグラウンドキュー無効（同上）
}
```

`incrementalCache` / `tagCache` / `queue` を `"dummy"` にしているのは、**Workers 環境では ISR（Incremental Static Regeneration）が動作しないため**です。
本プロジェクトでは ISR を使わず、すべてのページを動的レンダリング（SSR）とすることでこの制約を回避しています。

### 開発フローの二段階ビルド

```bash
# 通常の Next.js 開発（Node.js ランタイムで動作、HMR あり）
npm run dev

# Cloudflare 環境の確認（Workers ランタイムで動作、HMR なし）
npm run preview
```

`npm run dev` は Node.js 上で動くため、Workers 固有の挙動（API の非互換等）を検出できません。
本番に近い挙動を確認するには `npm run preview`（`wrangler dev`）での動作確認が必要です。

---

## データベース — Prisma × Cloudflare D1

### なぜ D1 を選んだか

- Cloudflare Workers と同一エコシステム内で完結するため、DB 接続のレイテンシが極小
- SQLite 互換のため Prisma との相性が良い
- 無料枠（5GB ストレージ、500万行読み取り/日）が個人開発初期に十分

### Prisma の Workers 対応（標準から外れた点）

通常の Prisma は Node.js 前提で、TCP ソケット経由でデータベースに接続します。
Workers の V8 Isolate 環境では TCP 接続が使えないため、**Prisma D1 アダプター**を経由して D1 の HTTP API を呼び出す構成にしています。

```ts
// lib/db.ts
import { PrismaD1 } from "@prisma/adapter-d1";

export function createPrismaClient(db: D1Database): PrismaClient {
  const adapter = new PrismaD1(db);
  return new PrismaClient({ adapter });
}
```

`D1Database` は Cloudflare Workers の環境変数（バインディング）として注入されます。
Server Action や API Route でデータベースを使う場合は、`process.env` ではなく **Workers の `env` オブジェクト**から `DB` バインディングを取得する必要があります。

### ローカル開発と本番の非対称性

| 環境 | DB | 接続方式 |
|---|---|---|
| `npm run dev`（Node.js） | ローカル SQLite | Prisma 標準（TCP） |
| `npm run preview`（Workers） | ローカル D1 エミュレータ | PrismaD1 アダプター |
| 本番（Workers） | Cloudflare D1 | PrismaD1 アダプター |

`npm run dev` 時はアダプターなしの通常 Prisma クライアントを使用しているため、`lib/db.ts` では `NODE_ENV` で分岐しています。
この非対称性により、開発中は高速な HMR が使える一方、D1 固有の挙動（SQL の方言差異など）は `npm run preview` で確認する必要があります。

---

## フロントエンド

### Next.js 16 (App Router)

- **バージョン**: 16.1.6
- Server Components / Client Components を使い分ける構成
- ビルドツールに Turbopack を使用（`next dev` 時）

### React 19

- **バージョン**: 19.2.3
- Server Actions, `use` フックなど React 19 の機能を活用

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

- **スタイル**: New York / **ベースカラー**: Neutral / **CSS 変数**: 有効
- 依存ライブラリ:
  - `radix-ui` ^1.4.3 — アクセシブルなプリミティブ UI コンポーネント
  - `class-variance-authority` ^0.7.1 — バリアントベースのクラス管理
  - `clsx` ^2.1.1 — 条件付きクラス結合
  - `tailwind-merge` ^3.5.0 — Tailwind クラスの衝突解決
  - `lucide-react` ^0.577.0 — アイコンセット

---

## テスト

### Vitest

- **バージョン**: ^4.0.18
- 単体テスト / コンポーネントテスト（`jsdom` 環境）
- 関連ライブラリ: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`

### Playwright

- **バージョン**: ^1.58.2
- E2E テスト（テストファイル配置先: `e2e/`）

---

## リント

### ESLint 9

- **バージョン**: ^9
- `eslint-config-next` 16.1.6 をベース設定として使用

---

## 主要コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動（Node.js + Turbopack） |
| `npm run build` | プロダクションビルド（Next.js） |
| `npm run cf:build` | Cloudflare 向けビルド（opennextjs） |
| `npm run preview` | Cloudflare ローカルプレビュー（Workers ランタイム） |
| `npm run deploy` | Cloudflare Workers へデプロイ |
| `npm run typecheck` | TypeScript 型チェック（`tsc --noEmit`） |
| `npm run lint` | ESLint 実行 |
| `npm run test` | Vitest 単体テスト |
| `npm run e2e` | Playwright E2E テスト |
