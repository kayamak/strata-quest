import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { findOrCreatePlayerProfile, findPlayHistory } from '@/lib/db/player';
import { findUnlockedVocabulary } from '@/lib/db/vocabulary';
import PlayerStatsCard from '@/components/player/PlayerStatsCard';
import PlayHistoryList from '@/components/player/PlayHistoryList';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/auth/signin');
  const userId = session.user.id;

  const [profile, history, unlockedVocab] = await Promise.all([
    findOrCreatePlayerProfile(userId),
    findPlayHistory(userId),
    findUnlockedVocabulary(userId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">マイページ</h1>
          <p className="text-slate-500">
            {session.user.name ?? session.user.email}
          </p>
        </div>
        <Link
          href="/quests"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
        >
          クエストへ →
        </Link>
      </div>

      <PlayerStatsCard profile={profile} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">解放済み語彙</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">
            {unlockedVocab.length}
            <span className="ml-1 text-base font-normal text-slate-400">
              語
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">プレイ回数（7日間）</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">
            {history.length}
            <span className="ml-1 text-base font-normal text-slate-400">
              回
            </span>
          </p>
        </div>
      </div>

      <PlayHistoryList history={history} />
    </div>
  );
}
