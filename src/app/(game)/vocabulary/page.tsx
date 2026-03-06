import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import VocabularyTree from '@/components/vocabulary/VocabularyTree';
import { getUnlockedVocabularyIds, findVocabularyTree } from '@/lib/db/vocabulary';

export default async function VocabularyPage() {
  const sessionAuth = await getSession();
  if (!sessionAuth?.user?.id) redirect('/auth/signin');

  const nodes = await findVocabularyTree();

  const unlockedIds = await getUnlockedVocabularyIds(sessionAuth.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold text-slate-800">語彙地層マップ</h1>
      <p className="mb-8 rounded-lg border border-blue-100 bg-blue-50 p-4 leading-relaxed text-slate-600 shadow-sm">
        解放した語彙の階層関係を確認できます。上の層ほど抽象度が高く、下の層ほど具体的です。
      </p>

      <VocabularyTree nodes={nodes} unlockedIds={unlockedIds} />
    </div>
  );
}
