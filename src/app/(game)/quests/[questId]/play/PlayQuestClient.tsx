'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QuestionDisplay from '@/components/quest/QuestionDisplay';
import { submitAnswer, completeQuest, abandonQuest } from '@/actions/quest';
import { revivePlayer, savePlayerHp } from '@/actions/player';
import { getLevelFromXp, getXpForLevel } from '@/lib/domain/level';
import { getMaxHp, getRevivalXpCost } from '@/lib/domain/hp';
import type { Question, AnswerOption } from '@/types';

type PlayQuestClientProps = {
  playSessionId: string;
  questId: string;
  questions: (Question & { answerOptions: AnswerOption[] })[];
  playerXp: number;
  playerLevel: number;
  playerHp: number;
};

const RPG_CLASS_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 10, title: '伝説の冒険者' },
  { minLevel: 7, title: '勇家' },
  { minLevel: 5, title: '熟練の冒険者' },
  { minLevel: 3, title: '冒険者' },
  { minLevel: 1, title: '見習い冒険者' },
];

function getClassTitle(level: number): string {
  const entry = RPG_CLASS_TITLES.find((c) => level >= c.minLevel);
  return entry?.title ?? '見習い冒険者';
}

type StatusPanelProps = {
  currentXp: number;
  sessionXp: number;
  hp: number;
  maxHp: number;
};

function StatusPanel({ currentXp, sessionXp, hp, maxHp }: StatusPanelProps) {
  const totalXp = currentXp + sessionXp;
  const level = getLevelFromXp(totalXp);
  const xpRange = getXpForLevel(level);
  const xpInLevel = totalXp - xpRange.current;
  const xpNeeded = xpRange.required - xpRange.current;
  const xpToNext = xpRange.required - totalXp;
  const progress = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;
  const classTitle = getClassTitle(level);
  const hpPercent = maxHp > 0 ? Math.min((hp / maxHp) * 100, 100) : 0;
  const hpColor =
    hpPercent > 50
      ? 'from-green-400 to-emerald-500'
      : hpPercent > 25
        ? 'from-yellow-400 to-amber-500'
        : 'from-red-500 to-rose-600';

  return (
    <div className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-900 to-purple-900 p-4 text-white shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚔️</span>
          <div>
            <p className="text-xs text-indigo-300">{classTitle}</p>
            <p className="text-lg font-bold leading-none">Lv. {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-indigo-300">このクエストで獲得</p>
          <p className="text-lg font-bold text-yellow-400 leading-none">
            +{sessionXp} XP
          </p>
        </div>
      </div>

      {/* HP バー */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-semibold text-red-300">HP</span>
          <span className="text-red-200">
            {hp} / {maxHp}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-indigo-950">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${hpColor} transition-all duration-300`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* XP バー */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-indigo-300">
          <span>
            {totalXp.toLocaleString()} / {xpRange.required.toLocaleString()} XP
          </span>
          <span>次のレベルまで {xpToNext.toLocaleString()} XP</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-indigo-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

type DeathModalProps = {
  dbLevel: number;
  dbXp: number;
  onRevive: () => void;
  onAbandon: () => void;
  isReviving: boolean;
};

function DeathModal({ dbLevel, dbXp, onRevive, onAbandon, isReviving }: DeathModalProps) {
  const revivalCost = getRevivalXpCost(dbLevel);
  const xpAfterRevival = Math.max(0, dbXp - revivalCost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-red-800 bg-gradient-to-b from-slate-900 to-red-950 p-6 text-center shadow-2xl">
        <div className="mb-2 text-6xl">💀</div>
        <h2 className="mb-1 text-2xl font-bold text-red-400">戦闘不能！</h2>
        <p className="mb-4 text-sm text-slate-400">HPが0になりました</p>

        <div className="mb-6 rounded-lg bg-black/40 p-4 text-sm">
          <p className="mb-2 text-slate-300">復活するには XP を消費します</p>
          <p className="text-xl font-bold text-red-400">
            -{revivalCost.toLocaleString()} XP
          </p>
          <p className="mt-1 text-xs text-slate-500">
            復活後の XP:{' '}
            <span className="text-slate-300">{xpAfterRevival.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRevive}
            disabled={isReviving}
            className="rounded-lg bg-gradient-to-r from-red-600 to-rose-500 px-4 py-3 font-bold text-white shadow transition hover:from-red-500 hover:to-rose-400 disabled:opacity-50"
          >
            {isReviving ? '復活中...' : '復活する'}
          </button>
          <button
            onClick={onAbandon}
            disabled={isReviving}
            className="rounded-lg border border-slate-600 px-4 py-3 text-sm text-slate-400 transition hover:border-slate-400 hover:text-slate-200 disabled:opacity-50"
          >
            クエストを諦める
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlayQuestClient({
  playSessionId,
  questId,
  questions,
  playerXp,
  playerLevel,
  playerHp,
}: PlayQuestClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);

  // HP / 復活管理
  const [dbXp, setDbXp] = useState(playerXp);
  const [dbLevel, setDbLevel] = useState(playerLevel);
  const initialMaxHp = getMaxHp(playerLevel);
  const maxHp = getMaxHp(dbLevel);
  const initialHp = Math.min(playerHp, initialMaxHp);
  const [hp, setHp] = useState(initialHp);
  const [isDead, setIsDead] = useState(initialHp <= 0);
  const [isReviving, setIsReviving] = useState(false);

  // interval 内から参照するための ref（stale closure 回避）
  const hpRef = useRef(initialHp);
  const isDeadRef = useRef(initialHp <= 0);
  const isCompletingRef = useRef(false);

  // マウント時に1回だけ interval を張る
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isDeadRef.current || isCompletingRef.current) return;

      const next = Math.max(0, hpRef.current - 10);
      hpRef.current = next;
      setHp(next);

      if (next === 0) {
        isDeadRef.current = true;
        setIsDead(true);
        void savePlayerHp(0);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleRevive = async () => {
    setIsReviving(true);
    try {
      const result = await revivePlayer();
      hpRef.current = result.newHp;
      isDeadRef.current = false;
      setHp(result.newHp);
      setIsDead(false);
      setDbXp(result.newXp);
      setDbLevel(result.newLevel);
    } finally {
      setIsReviving(false);
    }
  };

  const handleAbandon = async () => {
    await savePlayerHp(hpRef.current);
    await abandonQuest({ playSessionId });
    router.push('/quests');
  };

  const handleAnswer = useCallback(async (optionId: string, responseTimeMs: number) => {
    const questionId = questions[currentIndex].id;
    const result = await submitAnswer({
      playSessionId,
      questionId,
      selectedOptionId: optionId,
      responseTimeMs,
    });
    if (result.isCorrect) {
      setSessionXp((prev) => prev + result.xpEarned);
    }
    return result;
  }, [playSessionId, questions, currentIndex]);

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      isCompletingRef.current = true;
      await savePlayerHp(hpRef.current);
      try {
        await completeQuest({ playSessionId });
      } catch (e) {
        console.error(e);
      }
      router.push(`/quests/${questId}/result?session=${playSessionId}`);
    }
  };

  return (
    <>
      {isDead && (
        <DeathModal
          dbLevel={dbLevel}
          dbXp={dbXp}
          onRevive={handleRevive}
          onAbandon={handleAbandon}
          isReviving={isReviving}
        />
      )}

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg font-bold text-slate-700">⚔️ クエスト進行中</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <StatusPanel
          currentXp={dbXp}
          sessionXp={sessionXp}
          hp={hp}
          maxHp={maxHp}
        />

        <QuestionDisplay
          key={questions[currentIndex].id}
          question={questions[currentIndex]}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    </>
  );
}
