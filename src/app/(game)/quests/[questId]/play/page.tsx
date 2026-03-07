import { startPlaySession } from '@/actions/quest';
import PlayQuestClient from './PlayQuestClient';

type PageProps = {
  params: Promise<{ questId: string }>;
};

export default async function QuestPlayPage({ params }: PageProps) {
  const { questId } = await params;
  const { playSessionId, questions, playerXp, playerLevel, playerHp } =
    await startPlaySession(questId);

  return (
    <PlayQuestClient
      playSessionId={playSessionId}
      questId={questId}
      questions={questions}
      playerXp={playerXp}
      playerLevel={playerLevel}
      playerHp={playerHp}
    />
  );
}
