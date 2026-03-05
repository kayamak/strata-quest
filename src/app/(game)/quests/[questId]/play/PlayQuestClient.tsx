'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionDisplay from '@/components/quest/QuestionDisplay';
import { submitAnswer, completeQuest } from '@/actions/quest';
import type { Question, AnswerOption } from '@/types';

type PlayQuestClientProps = {
  playSessionId: string;
  questId: string;
  questions: (Question & { answerOptions: AnswerOption[] })[];
};

export default function PlayQuestClient({
  playSessionId,
  questId,
  questions,
}: PlayQuestClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnswer = async (optionId: string, responseTimeMs: number) => {
    const questionId = questions[currentIndex].id;
    return await submitAnswer({
      playSessionId,
      questionId,
      selectedOptionId: optionId,
      responseTimeMs,
    });
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
      <h2 className="mb-6 text-2xl font-bold text-slate-800">クエスト進行中</h2>
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
