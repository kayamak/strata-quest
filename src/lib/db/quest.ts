import { eq, and, asc, desc, sql, lte } from 'drizzle-orm';
import { getDb } from '@/lib/get-db';
import {
  quests,
  questions,
  answerOptions,
  playSessions,
  questionAnswers,
} from '@/db/schema';
import type { Quest, Question, AnswerOption, PlaySession } from '@/types';
import { SessionStatus } from '@/types';

type QuestionWithOptions = Question & { answerOptions: AnswerOption[] };
type QuestWithQuestions = Quest & { questions: QuestionWithOptions[] };

export async function findAvailableQuests(
  playerLevel: number
): Promise<Quest[]> {
  const db = await getDb();
  const result = await db.query.quests.findMany({
    where: and(
      eq(quests.isActive, true),
      lte(quests.requiredLevel, playerLevel)
    ),
    orderBy: [asc(quests.requiredLevel), asc(quests.difficulty)],
  });
  return result as Quest[];
}

export async function findAllActiveQuests(): Promise<Quest[]> {
  const db = await getDb();
  const result = await db.query.quests.findMany({
    where: eq(quests.isActive, true),
    orderBy: [asc(quests.requiredLevel), asc(quests.difficulty)],
  });
  return result as Quest[];
}

export async function findQuestById(
  questId: string
): Promise<QuestWithQuestions | null> {
  const db = await getDb();
  const quest = await db.query.quests.findFirst({
    where: eq(quests.id, questId),
    with: {
      questions: {
        orderBy: [asc(questions.sortOrder)],
        with: {
          answerOptions: {
            orderBy: [asc(answerOptions.sortOrder)],
          },
        },
      },
    },
  });
  return (quest as QuestWithQuestions) ?? null;
}

export async function createPlaySession(params: {
  userId: string;
  questId: string;
  totalQuestions: number;
}): Promise<PlaySession> {
  const db = await getDb();
  const [session] = await db
    .insert(playSessions)
    .values({
      userId: params.userId,
      questId: params.questId,
      status: SessionStatus.IN_PROGRESS,
      totalQuestions: params.totalQuestions,
    })
    .returning();
  return session as PlaySession;
}

export async function findPlaySession(
  sessionId: string
): Promise<PlaySession | null> {
  const db = await getDb();
  const session = await db.query.playSessions.findFirst({
    where: eq(playSessions.id, sessionId),
  });
  return (session as PlaySession) ?? null;
}

export async function recordQuestionAnswer(params: {
  playSessionId: string;
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  xpEarned: number;
  responseTimeMs: number;
  comboCountAtAnswer: number;
}): Promise<void> {
  const db = await getDb();

  // D1 の batch API を Drizzle 経由で利用
  await db.batch([
    db.insert(questionAnswers).values({
      playSessionId: params.playSessionId,
      questionId: params.questionId,
      selectedOptionId: params.selectedOptionId,
      isCorrect: params.isCorrect,
      xpEarned: params.xpEarned,
      responseTimeMs: params.responseTimeMs,
      comboCountAtAnswer: params.comboCountAtAnswer,
    }),
    db
      .update(playSessions)
      .set({
        totalXpEarned: sql`${playSessions.totalXpEarned} + ${params.xpEarned}`,
        ...(params.isCorrect
          ? { correctAnswers: sql`${playSessions.correctAnswers} + 1` }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(playSessions.id, params.playSessionId)),
  ]);
}

export async function updateSessionMaxCombo(
  sessionId: string,
  combo: number
): Promise<void> {
  const db = await getDb();
  const session = await db.query.playSessions.findFirst({
    where: eq(playSessions.id, sessionId),
    columns: { maxCombo: true },
  });
  if (session && combo > session.maxCombo) {
    await db
      .update(playSessions)
      .set({ maxCombo: combo, updatedAt: new Date() })
      .where(eq(playSessions.id, sessionId));
  }
}

export async function completePlaySession(
  sessionId: string
): Promise<PlaySession> {
  const db = await getDb();
  const [session] = await db
    .update(playSessions)
    .set({
      status: SessionStatus.COMPLETED,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(playSessions.id, sessionId))
    .returning();
  return session as PlaySession;
}

export async function abandonPlaySession(sessionId: string): Promise<void> {
  const db = await getDb();
  await db
    .update(playSessions)
    .set({ status: SessionStatus.ABANDONED, updatedAt: new Date() })
    .where(eq(playSessions.id, sessionId));
}

export async function getAnswerCount(sessionId: string): Promise<number> {
  const db = await getDb();
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(questionAnswers)
    .where(eq(questionAnswers.playSessionId, sessionId));
  return result[0]?.count ?? 0;
}

export async function getCurrentCombo(sessionId: string): Promise<number> {
  const db = await getDb();
  const answers = await db
    .select({ isCorrect: questionAnswers.isCorrect })
    .from(questionAnswers)
    .where(eq(questionAnswers.playSessionId, sessionId))
    .orderBy(desc(questionAnswers.createdAt));

  let combo = 0;
  for (const a of answers) {
    if (!a.isCorrect) break;
    combo++;
  }
  return combo;
}
