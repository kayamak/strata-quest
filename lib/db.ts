import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import type { D1Database } from "@cloudflare/workers-types";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export function createPrismaClient(db: D1Database): PrismaClient {
  const adapter = new PrismaD1(db);
  return new PrismaClient({ adapter });
}

// 開発環境用（ローカルSQLite）
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export { prisma };
