import Link from 'next/link';
import { getDb } from '@/lib/get-db';
import { eq } from 'drizzle-orm';
import { playSessions } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ questId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function QuestResultPage({
  params,
  searchParams,
}: PageProps) {
  await params;
  const { session: sessionId } = await searchParams;

  const sessionAuth = await getSession();
  if (!sessionAuth?.user?.id) redirect('/auth/signin');

  if (!sessionId || typeof sessionId !== 'string') {
    redirect(`/quests`);
  }

  const db = await getDb();
  const playSession = await db.query.playSessions.findFirst({
    where: eq(playSessions.id, sessionId),
    with: { quest: true },
  });

  if (!playSession || playSession.userId !== sessionAuth.user.id) {
    redirect(`/quests`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-center bg-gray-50 min-h-screen">
      <h2 className="mb-6 text-3xl font-bold text-slate-800">
        クエストクリア！
      </h2>
      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-slate-100">
        <p className="mb-2 text-lg font-medium border-b pb-2 text-slate-800">
          {playSession.quest.title}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-indigo-50 p-4">
            <p className="text-sm text-indigo-600 font-bold">正答数</p>
            <p className="text-3xl font-bold text-indigo-900">
              {playSession.correctAnswers}{' '}
              <span className="text-lg">/ {playSession.totalQuestions}</span>
            </p>
          </div>
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-sm text-green-600 font-bold">獲得XP</p>
            <p className="text-3xl font-bold text-green-900">
              +{playSession.totalXpEarned}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-orange-50 p-4">
          <p className="text-sm text-orange-600 font-bold">最大コンボ</p>
          <p className="text-3xl font-bold text-orange-900">
            {playSession.maxCombo}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Link
          href="/quests"
          className="rounded-lg bg-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          別のクエストを選ぶ
        </Link>
        <Link
          href="/profile"
          className="rounded-lg bg-white px-6 py-4 text-lg font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition"
        >
          マイページへ戻る
        </Link>
      </div>
    </div>
  );
}
