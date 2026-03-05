import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaClient = () => {
  let envDb: any;
  try {
    const ctx = getCloudflareContext({ async: false });
    envDb = (ctx?.env as any)?.DB;
  } catch (e) {
    // wait for request or context
  }

  // If we have a DB binding, we construct the edge D1 client.
  if (envDb) {
    const adapter = new PrismaD1(envDb);
    return new PrismaClient({ adapter });
  }

  // In local dev Node environment, DB binding is absent but we can run Node Prisma engine.
  // In production builds, this might also run during static generation if we don't mock it, but we should just try Node client.
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (!globalForPrisma.prisma) {
      console.log("Initializing Prisma for property:", prop);
      console.log((new Error()).stack);
      globalForPrisma.prisma = getPrismaClient();
    }
    const client = globalForPrisma.prisma as any;
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
