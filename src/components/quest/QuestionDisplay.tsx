'use client';

import { useState, useCallback } from 'react';
import TimerBar from './TimerBar';
import AnswerOptions from './AnswerOptions';
import type { Question, AnswerOption, AnswerResult } from '@/types';

type QuestionDisplayProps = {
  question: Question & { answerOptions: AnswerOption[] };
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (optionId: string, responseTimeMs: number) => Promise<AnswerResult>;
  onNext: () => void;
};

export default function QuestionDisplay({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onNext,
}: QuestionDisplayProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(() => Date.now());

  const handleSelect = useCallback(
    async (optionId: string) => {
      if (selectedId || isSubmitting) return;
      setSelectedId(optionId);
      setIsSubmitting(true);
      const responseTimeMs = Date.now() - startTime;
      try {
        const res = await onAnswer(optionId, responseTimeMs);
        setResult(res);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedId, isSubmitting, onAnswer, startTime]
  );

  const handleTimeUp = useCallback(() => {
    if (!selectedId) {
      handleSelect('__time_up__');
    }
  }, [selectedId, handleSelect]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          問題 {questionIndex + 1} / {totalQuestions}
        </span>
        {result && (
          <span
            className={
              result.isCorrect
                ? 'font-bold text-green-600'
                : 'font-bold text-red-500'
            }
          >
            {result.isCorrect ? `+${result.xpEarned} XP` : '不正解'}
          </span>
        )}
      </div>

      <TimerBar
        timeLimitSeconds={question.timeLimitSeconds}
        onTimeUp={handleTimeUp}
        running={!result}
      />

      <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
        <p className="text-lg font-medium text-slate-800">
          {question.questionText}
        </p>
      </div>

      <AnswerOptions
        options={question.answerOptions}
        selectedId={selectedId}
        correctId={result?.correctOptionId ?? null}
        onSelect={handleSelect}
        disabled={!!result || isSubmitting}
      />

      {result && (
        <div
          className={[
            'rounded-xl p-4',
            result.isCorrect
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800',
          ].join(' ')}
        >
          <p className="mb-2 font-bold">
            {result.isCorrect ? '正解！' : '不正解'}
          </p>
          <p className="text-sm">{result.explanation}</p>
          {result.currentCombo > 1 && (
            <p className="mt-1 text-sm font-medium">
              🔥 {result.currentCombo}コンボ！
            </p>
          )}
          <button
            onClick={onNext}
            className="mt-3 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50"
          >
            {questionIndex + 1 < totalQuestions
              ? '次の問題へ →'
              : '結果を見る →'}
          </button>
        </div>
      )}
    </div>
  );
}
