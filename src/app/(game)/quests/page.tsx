import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { findAllActiveQuests } from '@/lib/db/quest';
import { findOrCreatePlayerProfile } from '@/lib/db/player';
import QuestsClient from './QuestsClient';

export default async function QuestsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/auth/signin');
  const userId = session.user.id;

  const [profile, quests] = await Promise.all([
    findOrCreatePlayerProfile(userId),
    findAllActiveQuests(),
  ]);

  return <QuestsClient quests={quests} playerLevel={profile.level} />;
}
