import { startPlaySession } from '@/actions/quest';
import PlayQuestClient from './PlayQuestClient';

type PageProps = {
  params: Promise<{ questId: string }>;
};

export default async function QuestPlayPage({ params }: PageProps) {
  const { questId } = await params;
  const { playSessionId, questions } = await startPlaySession(questId);

  return (
    <PlayQuestClient
      playSessionId={playSessionId}
      questId={questId}
      questions={questions}
    />
  );
}
