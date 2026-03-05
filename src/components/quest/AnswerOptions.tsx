'use client';

import type { AnswerOption } from '@/types';

type AnswerOptionsProps = {
  options: AnswerOption[];
  selectedId: string | null;
  correctId: string | null;
  onSelect: (optionId: string) => void;
  disabled: boolean;
};

export default function AnswerOptions({
  options,
  selectedId,
  correctId,
  onSelect,
  disabled,
}: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        const isCorrect = correctId === option.id;
        const isWrong = isSelected && !isCorrect;

        let bgClass =
          'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50';
        if (correctId !== null) {
          // 回答後
          if (isCorrect) {
            bgClass = 'bg-green-50 border-green-500';
          } else if (isWrong) {
            bgClass = 'bg-red-50 border-red-400';
          } else {
            bgClass = 'bg-white border-slate-200 opacity-60';
          }
        }

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={[
              'rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all',
              bgClass,
              disabled && !correctId ? 'cursor-not-allowed' : '',
            ].join(' ')}
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {options.indexOf(option) + 1}
            </span>
            {option.text}
            {correctId !== null && isCorrect && (
              <span className="ml-2 text-green-600">✓</span>
            )}
            {isWrong && <span className="ml-2 text-red-500">✗</span>}
          </button>
        );
      })}
    </div>
  );
}
