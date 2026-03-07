'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionDisplay from '@/components/quest/QuestionDisplay';
import { submitAnswer, completeQuest } from '@/actions/quest';
import { getLevelFromXp, getXpForLevel } from '@/lib/domain/level';
import type { Question, AnswerOption } from '@/types';

type PlayQuestClientProps = {
  playSessionId: string;
  questId: string;
  questions: (Question & { answerOptions: AnswerOption[] })[];
  playerXp: number;
  playerLevel: number;
};

const RPG_CLASS_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 10, title: '伝説の冒険者' },
  { minLevel: 7, title: '勇者' },
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
};

function StatusPanel({ currentXp, sessionXp }: StatusPanelProps) {
  const totalXp = currentXp + sessionXp;
  const level = getLevelFromXp(totalXp);
  const xpRange = getXpForLevel(level);
  const xpInLevel = totalXp - xpRange.current;
  const xpNeeded = xpRange.required - xpRange.current;
  const xpToNext = xpRange.required - totalXp;
  const progress = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;
  const classTitle = getClassTitle(level);

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

export default function PlayQuestClient({
  playSessionId,
  questId,
  questions,
  playerXp,
}: PlayQuestClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);

  const handleAnswer = async (optionId: string, responseTimeMs: number) => {
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
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      try {
        await completeQuest({ playSessionId });
      } catch (e) {
        console.error(e);
      }
      router.push(`/quests/${questId}/result?session=${playSessionId}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg font-bold text-slate-700">⚔️ クエスト進行中</span>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <StatusPanel currentXp={playerXp} sessionXp={sessionXp} />

      <QuestionDisplay
        key={questions[currentIndex].id}
        question={questions[currentIndex]}
        questionIndex={currentIndex}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    </div>
  );
}
