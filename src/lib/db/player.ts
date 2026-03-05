import { prisma } from '@/lib/prisma';
import type { PlayerProfile, PlayHistoryItem } from '@/types';

export async function findOrCreatePlayerProfile(
  userId: string
): Promise<PlayerProfile> {
  const existing = await prisma.playerProfile.findUnique({
    where: { userId },
  });
  if (existing) return existing as PlayerProfile;

  const created = await prisma.playerProfile.create({
    data: { userId },
  });
  return created as PlayerProfile;
}

export async function findPlayerProfile(
  userId: string
): Promise<PlayerProfile | null> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });
  return profile as PlayerProfile | null;
}

export async function updatePlayerXpAndLevel(params: {
  userId: string;
  addXp: number;
  newLevel: number;
}): Promise<PlayerProfile> {
  const profile = await prisma.playerProfile.update({
    where: { userId: params.userId },
    data: {
      totalXp: { increment: params.addXp },
      level: params.newLevel,
    },
  });
  return profile as PlayerProfile;
}

export async function updatePlayerStats(params: {
  userId: string;
  abstractPower: number;
  specificPower: number;
  structureSense: number;
  vocabularyLevel: number;
}): Promise<void> {
  await prisma.playerProfile.update({
    where: { userId: params.userId },
    data: {
      abstractPower: { increment: params.abstractPower },
      specificPower: { increment: params.specificPower },
      structureSense: { increment: params.structureSense },
      vocabularyLevel: { increment: params.vocabularyLevel },
    },
  });
}

export async function findPlayHistory(
  userId: string
): Promise<PlayHistoryItem[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sessions = await prisma.playSession.findMany({
    where: {
      userId,
      startedAt: { gte: sevenDaysAgo },
      status: 'COMPLETED',
    },
    include: {
      quest: { select: { title: true } },
    },
    orderBy: { startedAt: 'desc' },
    take: 20,
  });

  return sessions.map((s) => ({
    id: s.id,
    questTitle: s.quest.title,
    correctAnswers: s.correctAnswers,
    totalQuestions: s.totalQuestions,
    totalXpEarned: s.totalXpEarned,
    completedAt: s.completedAt,
    startedAt: s.startedAt,
  }));
}
