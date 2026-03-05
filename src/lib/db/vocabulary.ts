import { prisma } from '@/lib/prisma';
import type { VocabularyNode } from '@/types';

export async function findVocabularyTree(): Promise<VocabularyNode[]> {
  const nodes = await prisma.vocabularyNode.findMany({
    orderBy: [{ abstractionLevel: 'desc' }, { word: 'asc' }],
  });
  return nodes as VocabularyNode[];
}

export async function findUnlockedVocabulary(
  userId: string
): Promise<VocabularyNode[]> {
  const unlocks = await prisma.vocabularyUnlock.findMany({
    where: { userId },
    include: { vocabularyNode: true },
    orderBy: { unlockedAt: 'desc' },
  });
  return unlocks.map((u) => u.vocabularyNode) as VocabularyNode[];
}

export async function getUnlockedVocabularyIds(
  userId: string
): Promise<string[]> {
  const unlocks = await prisma.vocabularyUnlock.findMany({
    where: { userId },
    select: { vocabularyNodeId: true },
  });
  return unlocks.map((u) => u.vocabularyNodeId);
}

export async function createVocabularyUnlocks(
  userId: string,
  vocabularyNodeIds: string[]
): Promise<void> {
  if (vocabularyNodeIds.length === 0) return;

  // SQLite doesn't support skipDuplicates in createMany, so we filter existing ones
  const existingUnlocks = await prisma.vocabularyUnlock.findMany({
    where: {
      userId,
      vocabularyNodeId: { in: vocabularyNodeIds },
    },
    select: { vocabularyNodeId: true },
  });

  const existingIds = new Set(existingUnlocks.map((u) => u.vocabularyNodeId));
  const newIds = vocabularyNodeIds.filter((id) => !existingIds.has(id));

  if (newIds.length === 0) return;

  await prisma.vocabularyUnlock.createMany({
    data: newIds.map((vocabularyNodeId) => ({
      userId,
      vocabularyNodeId,
    })),
  });
}

export async function findVocabularyToUnlock(
  playerLevel: number,
  alreadyUnlockedIds: string[],
  questVocabularyIds: string[]
): Promise<VocabularyNode[]> {
  const nodes = await prisma.vocabularyNode.findMany({
    where: {
      id: { in: questVocabularyIds },
      requiredPlayerLevel: { lte: playerLevel },
      NOT: {
        id: { in: alreadyUnlockedIds },
      },
    },
  });
  return nodes as VocabularyNode[];
}
