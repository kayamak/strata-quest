'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { findOrCreatePlayerProfile, findPlayHistory, findPlayerProfile, setPlayerXpAndLevel, updatePlayerHp } from '@/lib/db/player';
import { findUnlockedVocabulary } from '@/lib/db/vocabulary';
import { getLevelFromXp } from '@/lib/domain/level';
import { getMaxHp, getRevivalXpCost } from '@/lib/domain/hp';
import { AppError } from '@/types';
import type { PlayerProfile, PlayHistoryItem, VocabularyNode, ReviveResult } from '@/types';

export async function getOrCreatePlayerProfile(): Promise<PlayerProfile> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  return findOrCreatePlayerProfile(session.user.id);
}

export async function getPlayHistory(): Promise<PlayHistoryItem[]> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  return findPlayHistory(session.user.id);
}

export async function getUnlockedVocabularyList(): Promise<VocabularyNode[]> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  return findUnlockedVocabulary(session.user.id);
}

export async function revivePlayer(): Promise<ReviveResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  const userId = session.user.id;

  const profile = await findPlayerProfile(userId);
  if (!profile) {
    throw new AppError('Player not found', 'PLAYER_NOT_FOUND');
  }

  const xpCost = getRevivalXpCost(profile.level);
  const newXp = Math.max(0, profile.totalXp - xpCost);
  const newLevel = getLevelFromXp(newXp);
  const newHp = getMaxHp(newLevel);

  await setPlayerXpAndLevel({ userId, newXp, newLevel });
  await updatePlayerHp({ userId, currentHp: newHp });

  return { newXp, newLevel, newHp };
}

export async function savePlayerHp(hp: number): Promise<void> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  await updatePlayerHp({ userId: session.user.id, currentHp: hp });
}
