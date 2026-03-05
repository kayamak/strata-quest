import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession, signOut } from '@/lib/auth';

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 font-bold text-indigo-700 hover:text-indigo-800"
          >
            <span className="text-xl">🏔</span>
            <span>StrataQuest</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/quests"
              className="text-slate-600 hover:text-indigo-600"
            >
              クエスト
            </Link>
            <Link
              href="/vocabulary"
              className="text-slate-600 hover:text-indigo-600"
            >
              語彙マップ
            </Link>
            <Link
              href="/profile"
              className="text-slate-600 hover:text-indigo-600"
            >
              マイページ
            </Link>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600 hover:bg-slate-200"
              >
                ログアウト
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
