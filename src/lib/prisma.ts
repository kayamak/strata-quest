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
