import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = await getSession();
  if (session?.user) {
    redirect('/profile');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 p-6 text-white">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-6 text-7xl">🏔</div>
        <h1 className="mb-3 text-5xl font-extrabold tracking-tight">
          Strata<span className="text-indigo-400">Quest</span>
        </h1>
        <p className="mb-2 text-xl font-medium text-indigo-200">
          概念の地層を探索する英語語彙RPG
        </p>
        <p className="mb-8 text-slate-300">
          単語を暗記するのではなく、語彙が持つ「上位概念・下位概念」という構造を理解する。
          <br />
          抽象化力と具体化力を鍛えながら、英語語彙の階層世界を探索しよう。
        </p>

        <div className="mb-12 grid grid-cols-3 gap-4 text-sm">
          {[
            { icon: '🔼', title: '抽象化クエスト', desc: '具体→上位語を選ぶ' },
            { icon: '🔽', title: '具体化クエスト', desc: '抽象→具体例を選ぶ' },
            {
              icon: '🔗',
              title: '共通概念クエスト',
              desc: '複数語の共通上位語',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
            >
              <div className="mb-2 text-3xl">{item.icon}</div>
              <div className="mb-1 font-bold">{item.title}</div>
              <div className="text-xs text-slate-300">{item.desc}</div>
            </div>
          ))}
        </div>

        <Link
          href="/auth/signin"
          className="inline-block rounded-xl bg-indigo-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-indigo-400 hover:shadow-xl active:scale-95"
        >
          冒険を始める →
        </Link>
      </div>
    </main>
  );
}
