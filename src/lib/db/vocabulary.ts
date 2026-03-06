import { eq, and, inArray, lte, notInArray, desc, asc } from 'drizzle-orm';
import { getDb } from '@/lib/get-db';
import { vocabularyNodes, vocabularyUnlocks } from '@/db/schema';
import type { VocabularyNode } from '@/types';

export async function findVocabularyTree(): Promise<VocabularyNode[]> {
  const db = await getDb();
  const nodes = await db.query.vocabularyNodes.findMany({
    orderBy: [desc(vocabularyNodes.abstractionLevel), asc(vocabularyNodes.word)],
  });
  return nodes as VocabularyNode[];
}

export async function findUnlockedVocabulary(
  userId: string
): Promise<VocabularyNode[]> {
  const db = await getDb();
  const unlocks = await db.query.vocabularyUnlocks.findMany({
    where: eq(vocabularyUnlocks.userId, userId),
    with: { vocabularyNode: true },
    orderBy: [desc(vocabularyUnlocks.unlockedAt)],
  });
  return unlocks.map((u) => u.vocabularyNode) as VocabularyNode[];
}

export async function getUnlockedVocabularyIds(
  userId: string
): Promise<string[]> {
  const db = await getDb();
  const unlocks = await db
    .select({ vocabularyNodeId: vocabularyUnlocks.vocabularyNodeId })
    .from(vocabularyUnlocks)
    .where(eq(vocabularyUnlocks.userId, userId));
  return unlocks.map((u) => u.vocabularyNodeId);
}

export async function createVocabularyUnlocks(
  userId: string,
  vocabularyNodeIds: string[]
): Promise<void> {
  if (vocabularyNodeIds.length === 0) return;

  const db = await getDb();

  // 既存の unlock を除外
  const existingUnlocks = await db
    .select({ vocabularyNodeId: vocabularyUnlocks.vocabularyNodeId })
    .from(vocabularyUnlocks)
    .where(
      and(
        eq(vocabularyUnlocks.userId, userId),
        inArray(vocabularyUnlocks.vocabularyNodeId, vocabularyNodeIds)
      )
    );

  const existingIds = new Set(existingUnlocks.map((u) => u.vocabularyNodeId));
  const newIds = vocabularyNodeIds.filter((id) => !existingIds.has(id));

  if (newIds.length === 0) return;

  await db.insert(vocabularyUnlocks).values(
    newIds.map((vocabularyNodeId) => ({
      userId,
      vocabularyNodeId,
    }))
  );
}

export async function findVocabularyToUnlock(
  playerLevel: number,
  alreadyUnlockedIds: string[],
  questVocabularyIds: string[]
): Promise<VocabularyNode[]> {
  if (questVocabularyIds.length === 0) return [];

  const db = await getDb();

  const conditions = [
    inArray(vocabularyNodes.id, questVocabularyIds),
    lte(vocabularyNodes.requiredPlayerLevel, playerLevel),
  ];

  if (alreadyUnlockedIds.length > 0) {
    conditions.push(notInArray(vocabularyNodes.id, alreadyUnlockedIds));
  }

  const nodes = await db.query.vocabularyNodes.findMany({
    where: and(...conditions),
  });
  return nodes as VocabularyNode[];
}
