import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb, type AppDatabase } from '@/db';
import type { D1Database } from '@cloudflare/workers-types';

type CloudflareEnv = { DB: D1Database };

/**
 * Server Components / Server Actions から呼び出す DB クライアント取得関数。
 * Cloudflare Workers 環境（本番・ローカル wrangler dev）で D1 バインディングを取得する。
 */
export async function getDb(): Promise<AppDatabase> {
  const ctx = await getCloudflareContext({ async: true });
  const d1 = (ctx.env as CloudflareEnv).DB;
  if (!d1) {
    throw new Error('D1 database binding not found. Make sure wrangler is configured correctly.');
  }
  return createDb(d1);
}
