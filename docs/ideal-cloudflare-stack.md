# Cloudflare Workers 理想の技術スタック提案

> **作成日**: 2026-03-06  
> **対象プロジェクト**: StrataQuest（RPG 型英語学習アプリ）  
> **目的**: Cloudflare Workers 上で効率よく開発し、運用費を最小限に抑える技術スタックを提案する

---

## 目次

1. [現状の課題分析](#現状の課題分析)
2. [理想の技術スタック（推奨構成）](#理想の技術スタック推奨構成)
3. [各レイヤーの詳細と選定理由](#各レイヤーの詳細と選定理由)
4. [コスト試算](#コスト試算)
5. [現構成 vs 推奨構成の比較](#現構成-vs-推奨構成の比較)
6. [移行戦略](#移行戦略)
7. [段階的オプション](#段階的オプション)
8. [まとめ](#まとめ)

---

## 現状の課題分析

現在の StrataQuest の構成（Next.js + Prisma + opennextjs-cloudflare）は動作しているが、以下の課題がある。

### 🔴 パフォーマンス上の課題

| 課題 | 詳細 |
|---|---|
| **Prisma のバンドルサイズ** | WASM エンジンを含む Prisma Client は gzip 後でも約 950KB。Workers の起動時間とメモリ消費に直接影響する |
| **opennextjs-cloudflare の変換オーバーヘッド** | Next.js のビルド出力を Workers 向けに変換する中間レイヤーが存在し、ビルド時間が長い |
| **ISR 非対応** | Workers 環境では ISR が使えないため `incrementalCache`/`tagCache`/`queue` をすべて `dummy` にしている。Next.js の最大の強みの一つを活かせていない |

### 🟡 開発体験上の課題

| 課題 | 詳細 |
|---|---|
| **二段階ビルド** | `next build` → `opennextjs-cloudflare build` → `wrangler deploy` の 3 ステップが必要 |
| **ローカルと本番の非対称性** | `npm run dev` は Node.js、本番は V8 Isolate。挙動差異を `npm run preview` で別途確認する必要がある |
| **middleware 非互換** | Next.js の middleware（proxy.ts）が Workers と互換性がなく、Layout レベル認証に回避した |
| **Prisma の D1 トランザクション制限** | D1 の batch API を Prisma アダプターが活用できず、トランザクションの ACID 特性が保証されない |

### 🟢 活かすべき強み

- Cloudflare D1 の無料枠（5GB ストレージ、500 万行読み取り/日）
- Workers の無料枠（10 万リクエスト/日）
- ゼロコールドスタート
- グローバル 300+ PoP による低レイテンシ

---

## 理想の技術スタック（推奨構成）

```
┌──────────────────────────────────────────────────────────┐
│                     Cloudflare Workers                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │   Hono       │   │  React 19    │   │ Drizzle ORM  │ │
│  │  (Router /   │──▶│  (SSR with   │   │  (D1 直接    │ │
│  │   API)       │   │   hono/jsx)  │   │   接続)      │ │
│  └─────────────┘   └──────────────┘   └──────┬───────┘ │
│                                               │          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────▼───────┐ │
│  │ Cloudflare   │   │ Cloudflare   │   │ Cloudflare   │ │
│  │ R2           │   │ KV           │   │ D1           │ │
│  │ (静的アセット) │   │ (セッション)  │   │ (メイン DB)   │ │
│  └─────────────┘   └──────────────┘   └──────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 一覧

| レイヤー | 現構成 | 推奨構成 | 推奨理由 |
|---|---|---|---|
| **フレームワーク** | Next.js 16 + opennextjs-cloudflare | **Hono** | Workers ネイティブ。変換不要。<10KB |
| **フロントエンド** | React 19 (Server Components) | **React 19 + hono/jsx** or **Vite + React SPA** | Workers 上で直接 SSR できる |
| **ORM** | Prisma 6 + @prisma/adapter-d1 (WASM) | **Drizzle ORM** | バンドル 90% 削減。D1 ネイティブ対応 |
| **DB** | Cloudflare D1 | **Cloudflare D1**（変更なし） | 無料枠が十分。SQLite 互換 |
| **認証** | NextAuth v5 | **Lucia Auth** or **自前 JWT + KV** | Workers ネイティブ。軽量 |
| **セッション** | Cookie ベース (NextAuth) | **Cloudflare KV** | エッジでセッション管理。低レイテンシ |
| **静的アセット** | Workers Assets (.open-next/assets) | **Cloudflare R2 + CDN** or **Pages** | 無料枠 10GB。egress 無料 |
| **スタイリング** | Tailwind CSS v4 + shadcn/ui | **Tailwind CSS v4 + shadcn/ui**（変更なし） | 現構成で十分最適 |
| **テスト** | Vitest + Playwright | **Vitest + Playwright**（変更なし） | 現構成で十分 |
| **型チェック** | TypeScript 5 (strict) | **TypeScript 5 (strict)**（変更なし） | 変更不要 |

---

## 各レイヤーの詳細と選定理由

### 1. Hono — Workers ネイティブ Web フレームワーク

#### なぜ Next.js ではなく Hono か

| 比較軸 | Next.js + opennextjs | Hono |
|---|---|---|
| バンドルサイズ | 数 MB（Worker スクリプト全体） | **< 10KB**（フレームワーク本体） |
| ビルドステップ | `next build` → `opennextjs build` → `wrangler deploy` | **`wrangler deploy`** のみ |
| Workers 互換性 | 変換レイヤーで互換性問題が頻発 | **ネイティブ対応。変換不要** |
| middleware | 非互換（削除が必要だった） | **標準の middleware パターンをそのまま利用** |
| ISR / キャッシュ | 使用不可（dummy 設定） | **Workers KV / Cache API で独自実装可能** |
| 開発速度 | HMR あり（ただし Node.js 前提） | **Wrangler のローカル開発（Miniflare）で本番同等環境** |
| レスポンス速度 | 100〜300ms（変換オーバーヘッド含む） | **< 10ms**（V8 Isolate 直接実行） |

#### Hono の特徴

```ts
import { Hono } from 'hono';
import { renderer } from './renderer';    // hono/jsx SSR ミドルウェア
import { authMiddleware } from './middleware/auth';

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェア（認証）
app.use('/quests/*', authMiddleware);
app.use('/profile/*', authMiddleware);

// API Routes
app.get('/api/quests', async (c) => {
  const quests = await db.select().from(questsTable).all();
  return c.json(quests);
});

// SSR ページ
app.get('/quests/:id', renderer, async (c) => {
  const quest = await getQuest(c.env.DB, c.req.param('id'));
  return c.render(<QuestPage quest={quest} />);
});

export default app;
```

**ポイント:**
- `Bindings` 型で D1/KV/R2 バインディングに型安全にアクセス
- ミドルウェアが Workers ネイティブで動作（変換不要）
- `hono/jsx` で React ライクな JSX SSR が可能
- Cloudflare 公式が Hono をサポート・推奨

---

### 2. Drizzle ORM — 軽量・高速な TypeScript ORM

#### なぜ Prisma ではなく Drizzle か

| 比較軸 | Prisma + D1 アダプター | Drizzle ORM |
|---|---|---|
| バンドルサイズ (gzip) | **~950 KB** | **~93 KB**（約 90% 削減） |
| エンジン | WASM エンジン（特殊設定が必要） | **SQL ファーストで WASM 不要** |
| D1 トランザクション | batch API 未活用 | **D1 の batch API をネイティブサポート** |
| コード生成 | `npx prisma generate` が必要 | **不要（TypeScript スキーマから直接推論）** |
| 設定ファイル | `schema.prisma` + `engineType = "wasm"` + `previewFeatures` | **TypeScript のみ** |
| クエリの透過性 | 抽象化が厚く生成 SQL が見えにくい | **SQL に近い API。生成 SQL が予測可能** |
| Workers 固有設定 | `serverExternalPackages`, `compatibility_date` 等 | **特別な設定不要** |
| 学習コスト | 高（Workers 向けの特殊設定多数） | **低（SQL 経験があれば直感的）** |

#### Drizzle のスキーマ定義

```ts
// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  image: text('image'),
});

export const quests = sqliteTable('quests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  difficulty: integer('difficulty').notNull().default(1),
  level: integer('level').notNull().default(1),
  category: text('category').notNull(),
});

export const vocabularies = sqliteTable('vocabularies', {
  id: text('id').primaryKey(),
  questId: text('quest_id').notNull().references(() => quests.id),
  word: text('word').notNull(),
  meaning: text('meaning').notNull(),
  example: text('example'),
});
```

#### Drizzle のクエリ

```ts
// src/db/index.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// 使用例
app.get('/api/quests', async (c) => {
  const db = createDb(c.env.DB);

  // 型安全なクエリ（Prisma と同等の DX）
  const allQuests = await db.select().from(schema.quests)
    .where(eq(schema.quests.level, 1))
    .orderBy(schema.quests.difficulty);

  return c.json(allQuests);
});
```

#### マイグレーション

```bash
# スキーマから SQL マイグレーションファイルを生成
npx drizzle-kit generate

# ローカル D1 に適用
npx wrangler d1 migrations apply strata-quest-db --local

# 本番 D1 に適用
npx wrangler d1 migrations apply strata-quest-db --remote
```

Drizzle Kit は D1 のマイグレーションワークフローに完全対応しており、`prisma migrate` + 手動 SQL 変換のような二重管理が不要になる。

---

### 3. 認証 — Lucia Auth or 自前 JWT + KV

#### 選択肢の比較

| 方式 | メリット | デメリット |
|---|---|---|
| **NextAuth v5**（現構成） | 豊富なプロバイダー対応 | Next.js 依存。Workers で制約多い |
| **Lucia Auth** | 軽量。D1/KV 対応。Workers ネイティブ | プロバイダー統合は Arctic ライブラリ別途 |
| **自前 JWT + KV** | 最軽量。完全制御。依存ゼロ | 実装コストが高い |
| **Cloudflare Access** | ゼロトラスト認証。実装不要 | 柔軟性が低い。有料プランが前提 |

#### 推奨: Lucia Auth + Arctic

```ts
// src/auth/lucia.ts
import { Lucia } from 'lucia';
import { D1Adapter } from '@lucia-auth/adapter-sqlite';

export function createAuth(db: D1Database) {
  const adapter = new D1Adapter(db, {
    user: 'users',
    session: 'sessions',
  });

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: { secure: true },
    },
    getUserAttributes: (attributes) => ({
      email: attributes.email,
      name: attributes.name,
    }),
  });
}
```

```ts
// Google OAuth with Arctic
import { Google } from 'arctic';

const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.BASE_URL}/auth/callback/google`
);
```

**Lucia Auth の利点:**
- D1 に直接セッションを保存（追加インフラ不要）
- Workers ネイティブ対応（Node.js API に依存しない）
- バンドルサイズが極小
- `Arctic` ライブラリで Google, GitHub 等の OAuth プロバイダーに対応

---

### 4. 静的アセット配信 — Cloudflare R2 + CDN

#### 現構成の問題点

現在は `.open-next/assets` ディレクトリを Workers の静的アセットとして配信しているが、opennextjs 依存。

#### 推奨: Cloudflare Pages（フロント）+ Workers（API）

```
┌────────────────────────────────────────┐
│           Cloudflare Pages             │
│  ┌──────────────────────────────────┐  │
│  │  Vite + React SPA               │  │
│  │  (静的 HTML/JS/CSS を配信)       │  │
│  │  + Tailwind CSS + shadcn/ui     │  │
│  └──────────────┬───────────────────┘  │
│                 │ API 呼び出し          │
│  ┌──────────────▼───────────────────┐  │
│  │  Pages Functions (= Workers)    │  │
│  │  Hono + Drizzle + D1           │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Cloudflare Pages のメリット:**
- 静的アセットの配信は **完全無料**（帯域制限なし）
- Pages Functions として Workers を統合可能
- `wrangler pages deploy` でワンステップデプロイ
- プレビューデプロイ（PR ごとの自動デプロイ）が標準装備
- Git 連携による自動デプロイが可能

---

### 5. セッション管理 — Cloudflare KV

```ts
// KV を使ったセッション管理
app.use('*', async (c, next) => {
  const sessionId = getCookie(c, 'session_id');
  if (sessionId) {
    const session = await c.env.KV.get(`session:${sessionId}`, 'json');
    c.set('session', session);
  }
  await next();
});
```

**KV の無料枠:**
- 読み取り: 10 万回/日
- 書き込み: 1,000 回/日
- ストレージ: 1 GB

セッション管理には十分な容量。Lucia Auth はセッションを D1 に保存するため、KV を使わずとも動作するが、頻繁なセッション検証を KV に委譲することで D1 の読み取り行数を節約できる。

---

### 6. キャッシュ戦略 — Workers Cache API

Next.js の ISR が使えない代わりに、Workers の Cache API で同等の機能を実現する。

```ts
// キャッシュ付きデータ取得
app.get('/api/quests', async (c) => {
  const cache = caches.default;
  const cacheKey = new Request(c.req.url);

  // キャッシュヒット確認
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // DB から取得
  const db = createDb(c.env.DB);
  const quests = await db.select().from(schema.quests).all();

  // レスポンスをキャッシュ（5 分間）
  const response = c.json(quests);
  response.headers.set('Cache-Control', 's-maxage=300');
  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
});
```

---

## コスト試算

### 想定トラフィック（個人開発〜小規模リリース）

| 指標 | 想定値 |
|---|---|
| DAU（日次アクティブユーザー） | 100〜1,000 |
| リクエスト数/日 | 5,000〜50,000 |
| DB 読み取り行数/日 | 50,000〜500,000 |
| DB 書き込み行数/日 | 1,000〜10,000 |
| ストレージ使用量 | < 500 MB |

### 無料枠で収まる範囲

| サービス | 無料枠 | 想定利用量 | 判定 |
|---|---|---|---|
| Workers | 10 万 req/日 | 5 万 req/日 | ✅ 無料枠内 |
| D1 読み取り | 500 万行/日 | 50 万行/日 | ✅ 無料枠内 |
| D1 書き込み | 10 万行/日 | 1 万行/日 | ✅ 無料枠内 |
| D1 ストレージ | 5 GB | 500 MB | ✅ 無料枠内 |
| KV 読み取り | 10 万回/日 | 5 万回/日 | ✅ 無料枠内 |
| KV 書き込み | 1,000 回/日 | 500 回/日 | ✅ 無料枠内 |
| R2 ストレージ | 10 GB/月 | 1 GB | ✅ 無料枠内 |
| R2 egress | **無料** | — | ✅ 常に無料 |
| Pages | **無料**（静的配信） | — | ✅ 常に無料 |

### 月額コスト比較

| 構成 | DAU 100 | DAU 1,000 | DAU 10,000 |
|---|---|---|---|
| **推奨構成（Cloudflare 完結）** | **$0** | **$0** | **$5**（Workers 有料プラン） |
| 現構成 (Next.js + Prisma + CF Workers) | $0 | $0 | $5 |
| Vercel + PlanetScale | $0 | $20〜 | $40〜 |
| AWS Lambda + RDS | $15〜 | $30〜 | $100〜 |
| Railway / Render | $5〜 | $10〜 | $25〜 |

> **結論**: DAU 10,000 までは **月額 $0〜$5** で運用可能。推奨構成と現構成でコスト差は小さいが、推奨構成はパフォーマンス面で大きな優位性がある。

---

## 現構成 vs 推奨構成の比較

### パフォーマンス

| 指標 | 現構成 | 推奨構成 | 改善幅 |
|---|---|---|---|
| Worker バンドルサイズ | ~3 MB | **~200 KB** | **93% 削減** |
| ORM バンドルサイズ (gzip) | ~950 KB | **~93 KB** | **90% 削減** |
| レスポンス時間（API） | 100〜300 ms | **< 30 ms** | **3〜10x 高速** |
| ビルド時間 | 60〜90 秒 | **10〜20 秒** | **3〜5x 高速** |
| デプロイステップ | 3 ステップ | **1 ステップ** | 大幅に簡略化 |

### 開発体験

| 項目 | 現構成 | 推奨構成 |
|---|---|---|
| ローカル開発 | Node.js ランタイム（本番と異なる） | **Miniflare（本番同等の V8 Isolate）** |
| Workers 固有の設定 | 多数（WASM, アダプター, 外部パッケージ等） | **最小限（Bindings 型定義のみ）** |
| middleware | 非互換（削除が必要） | **ネイティブ対応** |
| DB マイグレーション | Prisma + 手動 SQL 変換 | **Drizzle Kit で統一** |
| コード生成 | `prisma generate` が必要 | **不要（型推論）** |

### リスク

| リスク | 現構成 | 推奨構成 |
|---|---|---|
| opennextjs の互換性 | 🔴 Next.js アップデートで壊れるリスク | ✅ 依存しない |
| Prisma D1 アダプターの成熟度 | 🟡 プレビュー機能に依存 | ✅ Drizzle は D1 を GA サポート |
| フレームワーク変更コスト | — | 🔴 全面書き換えが必要 |
| エコシステム | ✅ Next.js は巨大なエコシステム | 🟡 Hono は成長中 |

---

## 移行戦略

### フェーズ 1: ORM 移行（リスク低・効果高）⭐ 最優先

**所要時間**: 2〜3 日  
**効果**: バンドルサイズ 90% 削減、Workers 固有設定の大幅削減

```
Prisma → Drizzle ORM への移行

1. Drizzle スキーマを定義（既存の schema.prisma から変換）
2. drizzle-kit でマイグレーションファイル生成
3. src/lib/prisma.ts → src/lib/db.ts に書き換え
4. 各 Server Component / API Route のクエリを書き換え
5. Prisma 関連パッケージをアンインストール
6. next.config.ts の serverExternalPackages を削除
7. schema.prisma の engineType/previewFeatures 設定を削除
```

**この段階では Next.js + opennextjs を維持する。** ORM だけを変えることで、最小の変更で最大の効果を得る。

### フェーズ 2: 認証移行（リスク中・効果中）

**所要時間**: 1〜2 日  
**効果**: NextAuth の Workers 非互換問題を根本解決

```
NextAuth v5 → Lucia Auth + Arctic への移行

1. Lucia Auth + Arctic をインストール
2. セッション / ユーザーテーブルを Lucia 互換に調整
3. Google OAuth フローを Arctic で再実装
4. 認証ミドルウェアを Hono or Layout レベルで実装
5. NextAuth 関連パッケージをアンインストール
```

### フェーズ 3: フレームワーク移行（リスク高・効果高）

**所要時間**: 1〜2 週間  
**効果**: opennextjs 依存排除、ビルド・デプロイの劇的高速化

```
Next.js + opennextjs → Hono + React SPA (Vite) への移行

1. Hono プロジェクトを新規作成
2. API Routes を Hono ルーターに移植
3. React コンポーネントを Vite + React SPA に移植
4. shadcn/ui コンポーネントはそのまま流用
5. SSR が必要なページは hono/jsx で実装
6. Cloudflare Pages にデプロイ先を変更
7. opennextjs, next.js 関連パッケージをアンインストール
```

---

## 段階的オプション

全面移行がリスクの場合、以下の段階的改善も有効。

### オプション A: 現構成を維持 + 部分最適化

Next.js + opennextjs を維持しつつ、ボトルネックだけを解消する。

| 改善 | 内容 | 効果 |
|---|---|---|
| Prisma → Drizzle | ORM のみ変更 | バンドル 90% 削減 |
| Cache API 導入 | Workers Cache API でレスポンスキャッシュ | レスポンス高速化 |
| Static Assets → R2 | 静的ファイルの配信最適化 | 配信の安定性向上 |

### オプション B: Hono をバックエンド API にだけ採用

Next.js をフロントエンドとして維持し、API 層だけを Hono Workers に分離する。

```
Cloudflare Pages              Cloudflare Workers
┌──────────────────┐         ┌──────────────────┐
│  Next.js (SSG)   │ ──API──▶│  Hono            │
│  React SPA       │         │  Drizzle + D1    │
│  Static Export   │         │  Lucia Auth      │
└──────────────────┘         └──────────────────┘
```

- Next.js を `output: "export"` で静的サイトとしてビルド
- API は Hono Workers が担当
- opennextjs が不要になる
- 段階的にフロント側も Vite + React SPA に移行可能

### オプション C: SvelteKit or Astro による書き換え

React / Next.js から離れて、Workers ネイティブなフレームワークで書き直す。

| フレームワーク | Workers 対応 | SSR | 特徴 |
|---|---|---|---|
| **SvelteKit** | `adapter-cloudflare` 公式対応 | ✅ | バンドルサイズ最小。学習コスト低 |
| **Astro** | `@astrojs/cloudflare` 公式対応 | ✅ (ハイブリッド) | コンテンツ重視のサイトに最適 |

> StrataQuest は RPG UI が中心のインタラクティブアプリであるため、SPA 的な操作感が重要。**SvelteKit はフルスタック対応で有力な選択肢**だが、既存の React コンポーネント（shadcn/ui）の資産を活かすなら **Hono + React SPA が最も現実的**。

---

## まとめ

### 推奨アクション（優先度順）

| 優先度 | アクション | 効果 | コスト |
|---|---|---|---|
| 🔴 **1** | **Prisma → Drizzle ORM に移行** | バンドル 90% 削減。設定簡素化 | 2〜3 日 |
| 🟡 **2** | **Workers Cache API を導入** | レスポンス高速化 | 半日 |
| 🟡 **3** | **NextAuth → Lucia Auth に移行** | Workers 非互換問題の解消 | 1〜2 日 |
| 🟢 **4** | **Next.js → Hono + React SPA に移行** | 最大の効果。完全な Workers 最適化 | 1〜2 週間 |

### 理想的な最終構成

```
Hono (< 10KB) + Drizzle ORM (~93KB) + Cloudflare D1 + KV + R2
= 月額 $0 で DAU 10,000 まで対応可能な高速エッジアプリケーション
```

個人開発の初期フェーズでは **フェーズ 1（ORM 移行）だけ** でも大きな効果がある。  
ユーザー数の成長に応じて段階的にスタックを最適化していくことを推奨する。
