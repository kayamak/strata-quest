'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import QuestCard from '@/components/quest/QuestCard';
import type { Quest } from '@/types';

type QuestsPageProps = {
  quests: Quest[];
  playerLevel: number;
};

export default function QuestsClient({ quests, playerLevel }: QuestsPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStart = (questId: string) => {
    startTransition(() => {
      router.push(`/quests/${questId}/play`);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">クエスト選択</h1>
        <p className="text-slate-500">現在のレベル: Lv {playerLevel}</p>
      </div>

      {quests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          利用可能なクエストがありません
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quests.map((quest) => {
            const isLocked = quest.requiredLevel > playerLevel;
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStart={handleStart}
                disabled={isPending || isLocked}
                isLocked={isLocked}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
