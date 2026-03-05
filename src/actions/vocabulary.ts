'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  findVocabularyTree,
  getUnlockedVocabularyIds,
} from '@/lib/db/vocabulary';
import type { VocabularyNode } from '@/types';

export type VocabularyTreeData = {
  nodes: VocabularyNode[];
  unlockedIds: string[];
};

export async function getVocabularyTree(): Promise<VocabularyTreeData> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  const userId = session.user.id;

  const [nodes, unlockedIds] = await Promise.all([
    findVocabularyTree(),
    getUnlockedVocabularyIds(userId),
  ]);

  return { nodes, unlockedIds };
}
