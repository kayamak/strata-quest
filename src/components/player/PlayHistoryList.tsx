import type { PlayHistoryItem } from '@/types';

type PlayHistoryListProps = {
  history: PlayHistoryItem[];
};

export default function PlayHistoryList({ history }: PlayHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        まだプレイ履歴がありません
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <h3 className="font-bold text-slate-700">直近の学習履歴</h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {history.map((item) => {
          const accuracy =
            item.totalQuestions > 0
              ? Math.round((item.correctAnswers / item.totalQuestions) * 100)
              : 0;
          const dateStr = item.completedAt
            ? new Date(item.completedAt).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-';

          return (
            <li
              key={item.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {item.questTitle}
                </p>
                <p className="text-xs text-slate-400">{dateStr}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-indigo-600">
                  +{item.totalXpEarned} XP
                </p>
                <p className="text-xs text-slate-500">
                  {item.correctAnswers}/{item.totalQuestions}問正解 ({accuracy}
                  %)
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
