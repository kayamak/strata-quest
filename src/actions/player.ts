'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { findOrCreatePlayerProfile, findPlayHistory } from '@/lib/db/player';
import { findUnlockedVocabulary } from '@/lib/db/vocabulary';
import type { PlayerProfile, PlayHistoryItem, VocabularyNode } from '@/types';

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
