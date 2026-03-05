import Badge from '@/components/ui/Badge';
import type { Quest } from '@/types';

type QuestCardProps = {
  quest: Quest;
  onStart: (questId: string) => void;
  disabled?: boolean;
  isLocked?: boolean;
};

const questTypeLabels: Record<string, string> = {
  GENERALIZE: '抽象化',
  SPECIFY: '具体化',
  COMMON_CONCEPT: '共通概念',
  ABSTRACT_RALLY: '抽象ラリー',
};

export default function QuestCard({
  quest,
  onStart,
  disabled,
  isLocked,
}: QuestCardProps) {
  const starsCount = Math.max(0, Math.min(10, quest.difficulty));
  const difficultyStars =
    '★'.repeat(starsCount) + '☆'.repeat(Math.max(0, 10 - starsCount));

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${isLocked ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-white'}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3
          className={`font-bold ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}
        >
          {isLocked ? '🔒 ' : ''}
          {quest.title}
        </h3>
        <Badge variant={isLocked ? 'default' : 'info'}>
          {questTypeLabels[quest.questType] ?? quest.questType}
        </Badge>
      </div>
      <p className="mb-3 text-sm text-slate-500">{quest.description}</p>
      <div className="mb-4 flex items-center gap-4 text-sm text-slate-500">
        <span title="難易度">{difficultyStars}</span>
        <span>問題数: {quest.questionCount}問</span>
        <span>報酬: {quest.baseXpReward} XP</span>
        <span className={isLocked ? 'font-bold text-amber-600' : ''}>
          Lv{quest.requiredLevel}〜
        </span>
      </div>
      <button
        onClick={() => onStart(quest.id)}
        disabled={disabled || isLocked}
        className={`w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors 
          ${
            isLocked
              ? 'cursor-not-allowed bg-slate-300'
              : 'bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300'
          }`}
      >
        {isLocked ? `レベル${quest.requiredLevel}で解放` : 'クエスト開始'}
      </button>
    </div>
  );
}
