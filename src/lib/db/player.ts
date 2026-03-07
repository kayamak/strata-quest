import { eq, and, gte, desc } from 'drizzle-orm';
import { getDb } from '@/lib/get-db';
import { playerProfiles, playSessions, quests } from '@/db/schema';
import type { PlayerProfile, PlayHistoryItem } from '@/types';

export async function findOrCreatePlayerProfile(
  userId: string
): Promise<PlayerProfile> {
  const db = await getDb();
  const existing = await db.query.playerProfiles.findFirst({
    where: eq(playerProfiles.userId, userId),
  });
  if (existing) return existing as PlayerProfile;

  const [created] = await db.insert(playerProfiles)
    .values({ userId })
    .onConflictDoUpdate({
      target: playerProfiles.userId,
      set: { userId }
    })
    .returning();
  return created as PlayerProfile;
}

export async function findPlayerProfile(
  userId: string
): Promise<PlayerProfile | null> {
  const db = await getDb();
  const profile = await db.query.playerProfiles.findFirst({
    where: eq(playerProfiles.userId, userId),
  });
  return (profile as PlayerProfile) ?? null;
}

export async function updatePlayerXpAndLevel(params: {
  userId: string;
  addXp: number;
  newLevel: number;
}): Promise<PlayerProfile> {
  const db = await getDb();
  const current = await db.query.playerProfiles.findFirst({
    where: eq(playerProfiles.userId, params.userId),
  });
  if (!current) throw new Error('Player profile not found');

  const [updated] = await db
    .update(playerProfiles)
    .set({
      totalXp: current.totalXp + params.addXp,
      level: params.newLevel,
      updatedAt: new Date(),
    })
    .where(eq(playerProfiles.userId, params.userId))
    .returning();
  return updated as PlayerProfile;
}

export async function updatePlayerHp(params: {
  userId: string;
  currentHp: number;
}): Promise<void> {
  const db = await getDb();
  await db
    .update(playerProfiles)
    .set({ currentHp: params.currentHp, updatedAt: new Date() })
    .where(eq(playerProfiles.userId, params.userId));
}

export async function setPlayerXpAndLevel(params: {
  userId: string;
  newXp: number;
  newLevel: number;
}): Promise<PlayerProfile> {
  const db = await getDb();
  const [updated] = await db
    .update(playerProfiles)
    .set({
      totalXp: params.newXp,
      level: params.newLevel,
      updatedAt: new Date(),
    })
    .where(eq(playerProfiles.userId, params.userId))
    .returning();
  if (!updated) throw new Error('Player profile not found');
  return updated as PlayerProfile;
}

export async function updatePlayerStats(params: {
  userId: string;
  abstractPower: number;
  specificPower: number;
  structureSense: number;
  vocabularyLevel: number;
}): Promise<void> {
  const db = await getDb();
  const current = await db.query.playerProfiles.findFirst({
    where: eq(playerProfiles.userId, params.userId),
  });
  if (!current) throw new Error('Player profile not found');

  await db
    .update(playerProfiles)
    .set({
      abstractPower: current.abstractPower + params.abstractPower,
      specificPower: current.specificPower + params.specificPower,
      structureSense: current.structureSense + params.structureSense,
      vocabularyLevel: current.vocabularyLevel + params.vocabularyLevel,
      updatedAt: new Date(),
    })
    .where(eq(playerProfiles.userId, params.userId));
}

export async function findPlayHistory(
  userId: string
): Promise<PlayHistoryItem[]> {
  const db = await getDb();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sessions = await db.query.playSessions.findMany({
    where: and(
      eq(playSessions.userId, userId),
      gte(playSessions.startedAt, sevenDaysAgo),
      eq(playSessions.status, 'COMPLETED')
    ),
    with: {
      quest: { columns: { title: true } },
    },
    orderBy: [desc(playSessions.startedAt)],
    limit: 20,
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
