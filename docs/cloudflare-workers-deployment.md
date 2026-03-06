# Cloudflare Workers デプロイ対応ノウハウ

> **対象コミット範囲**: `407fd4a`（Cloudflareデプロイエラーの解消）〜 `fb6e664`（lint / 型エラー修正）  
> **作成日**: 2026-03-06

---

## 目次

1. [概要](#概要)
2. [Prisma D1 を Workers で動作させる](#prisma-d1-を-workers-で動作させる)
3. [middleware.ts の削除と認証方式の変更](#middlewarets-の削除と認証方式の変更)
4. [NextAuth authConfig の providers 重複キー警告](#nextauth-authconfig-の-providers-重複キー警告)
5. [wrangler.toml の設定ポイント](#wranglertoml-の設定ポイント)
6. [Node.js deprecation warning の抑制](#nodejs-deprecation-warning-の抑制)
7. [ESLint で .open-next を除外する](#eslint-で-open-next-を除外する)
8. [D1 シードデータの投入](#d1-シードデータの投入)
9. [トラブルシューティング](#トラブルシューティング)

---

## 概要

Next.js アプリを Cloudflare Workers にデプロイする際に発生した問題とその解決策をまとめています。  
主な技術スタックは以下のとおりです。

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| ビルド変換 | @opennextjs/cloudflare |
| ORM | Prisma 6 + @prisma/adapter-d1 |
| DB | Cloudflare D1 (SQLite 互換) |
| 認証 | NextAuth v5 |

---

## Prisma D1 を Workers で動作させる

### 問題

デプロイ後に「Internal Server Error」が発生。Workers 環境では Node.js のネイティブバイナリエンジンが動作しないため、通常の Prisma Client では DB 接続ができない。

### 解決策：4 つのファイルを変更

#### 1. `prisma/schema.prisma` — WASM エンジンと Driver Adapters を有効化

```prisma
generator client {
  provider        = "prisma-client-js"
  engineType      = "wasm"              # ← 追加: Node.js バイナリではなく WASM エンジンを使用
  previewFeatures = ["driverAdapters"]  # ← 追加: D1 アダプターを使うために必要
}
```

**なぜ必要か？**
- Prisma はデフォルトで Node.js 用のバイナリクエリエンジンを使う
- Workers の V8 Isolate では Node.js バイナリが動作しない
- `engineType = "wasm"` により、ブラウザ / Edge 環境で動作する WASM エンジンに切り替わる
- `previewFeatures = ["driverAdapters"]` は `@prisma/adapter-d1` を使用するために必要

#### 2. `src/lib/prisma.ts` — 環境に応じた PrismaClient の自動切り替え

```ts
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

type CloudflareEnv = { DB?: D1Database };

const getPrismaClient = (): PrismaClient => {
  let envDb: D1Database | undefined;
  try {
    const ctx = getCloudflareContext({ async: false });
    envDb = (ctx?.env as CloudflareEnv)?.DB;
  } catch {
    // ローカル環境では Cloudflare context が存在しない場合がある
  }

  // DB バインディングがある場合は D1 アダプターを使用（Cloudflare Workers 環境）
  if (envDb) {
    const adapter = new PrismaD1(envDb);
    return new PrismaClient({ adapter });
  }

  // ローカル開発環境では通常の Node.js Prisma クライアントを使用
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// グローバルシングルトンパターン（開発環境でのホットリロード対策）
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**ポイント:**
- `getCloudflareContext({ async: false })` で **同期的に** Workers の env を取得する
  - `async: false` がないと Promise が返り、トップレベルの初期化で使えない
- Workers 環境では D1 バインディング (`env.DB`) が存在するので、`PrismaD1` アダプターを使う
- ローカル `npm run dev` 時は Cloudflare context が存在しないため `catch` で無視し、通常の SQLite ファイルベースの Prisma Client を使う
- グローバルシングルトンパターンで、開発環境の HMR 時にクライアントが増殖するのを防ぐ

#### 3. `next.config.ts` — Prisma を外部パッケージとして指定

```ts
const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ["@prisma/client", ".prisma/client"],  // ← 追加
};
```

**なぜ必要か？**
- Next.js のバンドラーが Prisma Client をバンドルしようとすると、WASM ファイルの解決に失敗する
- `serverExternalPackages` により Prisma を外部モジュールとして扱い、バンドル対象から除外する

#### 4. `wrangler.toml` — compatibility_date の更新

```toml
compatibility_date = "2025-09-01"  # ← 2024-09-23 から更新
```

**なぜ必要か？**
- `2025-04-01` 以降の compatibility_date で Node.js 仮想ファイルシステム対応が有効化される
- Prisma WASM エンジンが内部的に使う Node.js 互換 API（`fs` 等）が適切に polyfill される

---

## middleware.ts の削除と認証方式の変更

### 問題

Next.js 16 の `middleware.ts`（旧 `proxy.ts`）は OpenNext/Cloudflare Workers と非互換。  
ビルド時にワーニングが発生し、デプロイ後にミドルウェアが正しく動作しない。

### 解決策

`src/middleware.ts` を削除し、`(game)/layout.tsx` でサーバーサイドの `getSession()` 呼び出しによる認証チェックに切り替えた。

**削除前の middleware.ts:**
```ts
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  if (process.env.OAUTH_SKIP === 'true') {
    return NextResponse.next();
  }
  return (auth as unknown as (req: NextRequest) => Promise<Response>)(request);
}

export const config = {
  matcher: ['/profile/:path*', '/quests/:path*', '/vocabulary/:path*'],
};
```

**代替手段: Layout レベルでの認証**
```ts
// src/app/(game)/layout.tsx
import { getSession } from '@/lib/auth';

export default async function GameLayout({ children }) {
  const session = await getSession();
  if (!session) {
    redirect('/auth/signin');
  }
  return <>{children}</>;
}
```

**判断の根拠:**
- `(game)/layout.tsx` がすでに `getSession()` で認証チェックしており、middleware は冗長だった
- middleware → proxy.ts 移行（Next.js 16 の変更）は OpenNext/Cloudflare と非互換
- Layout レベルの認証で十分なユースケースだった

---

## NextAuth authConfig の providers 重複キー警告

### 問題

`auth.ts` で `authConfig` をスプレッド展開する際に、`authConfig.providers`（空配列）と新たに定義する `providers`（Google プロバイダ）が重複し、wrangler ビルド時に `"Duplicate key providers"` 警告が出た。

### 解決策

スプレッド前に `providers` を分割代入で除外する。

```ts
// 修正前
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,          // ← authConfig.providers が含まれる
  adapter: PrismaAdapter(prisma),
  providers: [ Google({...}) ],  // ← 重複
});

// 修正後
const { providers: _, ...baseAuthConfig } = authConfig;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...baseAuthConfig,      // ← providers を除外
  adapter: PrismaAdapter(prisma),
  providers: [ Google({...}) ],
});
```

---

## wrangler.toml の設定ポイント

### assets ディレクトリの指定

```toml
[assets]
directory = ".open-next/assets"
```

`@opennextjs/cloudflare` がビルド時に静的アセットを `.open-next/assets` に出力する。  
この設定がないと、CSS や画像などの静的ファイルが配信されない。

### D1 バインディング

```toml
[[d1_databases]]
binding = "DB"
database_name = "strata-quest-db"
database_id = "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

- `binding = "DB"` は `src/lib/prisma.ts` で `(ctx.env as CloudflareEnv).DB` として参照する名前と一致させる
- `database_id` は `npx wrangler d1 create <name>` で事前に作成して取得する

### 最終的な wrangler.toml

```toml
name = "strata-quest"
compatibility_date = "2025-09-01"
compatibility_flags = ["nodejs_compat"]
main = ".open-next/worker.js"

[assets]
directory = ".open-next/assets"

[[d1_databases]]
binding = "DB"
database_name = "strata-quest-db"
database_id = "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

## Node.js deprecation warning の抑制

### 問題

`npm run deploy` などのスクリプト実行時に、opennextjs 内部依存の `punycode` モジュールに対する Node.js deprecation warning が表示される。

### 解決策

`NODE_NO_WARNINGS=1` を各スクリプトに付与して抑制。

```json
{
  "scripts": {
    "preview": "NODE_NO_WARNINGS=1 opennextjs-cloudflare build && NODE_NO_WARNINGS=1 wrangler dev",
    "deploy": "NODE_NO_WARNINGS=1 opennextjs-cloudflare build && NODE_NO_WARNINGS=1 wrangler deploy",
    "cf:build": "NODE_NO_WARNINGS=1 opennextjs-cloudflare build"
  }
}
```

---

## ESLint で .open-next を除外する

### 問題

`opennextjs-cloudflare build` が `.open-next/` ディレクトリにビルド成果物を出力する。  
このディレクトリが ESLint のチェック対象に含まれると、大量のlint エラーが発生する。

### 解決策

`eslint.config.mjs` の `globalIgnores` に `.open-next/**` を追加。

```js
globalIgnores([
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
  // Cloudflare/OpenNext build artifacts:
  ".open-next/**",   // ← 追加
]),
```

### 補足: `_` プレフィックスの未使用変数を許可

Workers 対応でスプレッド演算を使う際にデストラクチャリングで意図的に無視する変数（`const { providers: _, ...rest } = config`）が発生するため、ESLint の `no-unused-vars` ルールで `_` プレフィックスを許可する設定も追加。

```js
{
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', {
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
  },
},
```

---

## D1 シードデータの投入

### ローカル開発用（SQLite）

```bash
npm run db:seed    # npx tsx prisma/seeds/seed.ts を実行
```

TypeScript で書かれた `prisma/seeds/seed.ts` を実行し、ローカルの SQLite に直接データを投入する。

### Cloudflare D1 用

D1 には Prisma の seed 機能がそのまま使えないため、SQL ファイルを別途用意する。

```bash
# D1 にシードデータを投入
npx wrangler d1 execute strata-quest-db --remote --file=prisma/seeds/seed-d1.sql
```

- `prisma/seeds/seed-d1.sql` は `seed.ts` から手動変換した SQL
- `--remote` は本番 D1 に対して実行する場合。ローカルエミュレータの場合は `--local`
- SQL の先頭で `DELETE FROM` を実行して既存データをクリアしている（冪等性の確保）

---

## トラブルシューティング

### 「Maximum call stack size exceeded」エラー (prisma.ts)

**原因**: `getCloudflareContext()` を Proxy パターンで遅延初期化する実装で無限再帰が発生していた。

**解決**: Proxy を使わず、モジュール初期化時に一度だけ `getPrismaClient()` を呼ぶシンプルなパターンに変更。

### 「Internal Server Error」(デプロイ後)

**チェックリスト:**
1. `prisma/schema.prisma` に `engineType = "wasm"` と `previewFeatures = ["driverAdapters"]` があるか
2. `next.config.ts` の `serverExternalPackages` に `@prisma/client` と `.prisma/client` が含まれているか
3. `wrangler.toml` の `compatibility_date` が `2025-04-01` 以降か
4. `wrangler.toml` の D1 バインディング名（`binding = "DB"`）が `prisma.ts` の参照と一致しているか
5. `npx prisma generate` を実行して WASM 版のクライアントが生成されているか

### wrangler ビルド時の「Duplicate key」警告

**原因**: オブジェクトスプレッドで同じキーが重複する場合に発生。  
**解決**: スプレッド元から重複するキーをデストラクチャリングで除外（[上記参照](#nextauth-authconfig-の-providers-重複キー警告)）。

### ESLint エラーが大量に出る

**原因**: `.open-next/` のビルド成果物がチェック対象に含まれている。  
**解決**: `eslint.config.mjs` の `globalIgnores` に `.open-next/**` を追加（[上記参照](#eslint-で-open-next-を除外する)）。

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `prisma/schema.prisma` | `engineType = "wasm"` / `previewFeatures = ["driverAdapters"]` 追加 |
| `src/lib/prisma.ts` | Workers 環境で D1 アダプターを使用するよう分岐処理を追加 |
| `next.config.ts` | `serverExternalPackages` に Prisma 関連パッケージを追加 |
| `wrangler.toml` | `compatibility_date` 更新、`[assets]` セクション追加 |
| `src/lib/auth.ts` | `providers` 重複キー警告の解消 |
| `src/middleware.ts` | 削除（Layout レベル認証に移行） |
| `package.json` | `NODE_NO_WARNINGS=1` 追加、`db:seed` スクリプト追加 |
| `eslint.config.mjs` | `.open-next/**` 除外、`_` プレフィックス未使用変数許可 |
| `prisma/seeds/seed-d1.sql` | D1 用シード SQL の新規作成 |
