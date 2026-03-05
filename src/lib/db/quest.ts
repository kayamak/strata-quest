import { prisma } from '@/lib/prisma';
import type { Quest, Question, AnswerOption, PlaySession } from '@/types';
import { SessionStatus } from '@/types';

type QuestionWithOptions = Question & { answerOptions: AnswerOption[] };

type QuestWithQuestions = Quest & { questions: QuestionWithOptions[] };

export async function findAvailableQuests(
  playerLevel: number
): Promise<Quest[]> {
  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      requiredLevel: { lte: playerLevel },
    },
    orderBy: [{ requiredLevel: 'asc' }, { difficulty: 'asc' }],
  });
  return quests as Quest[];
}

export async function findAllActiveQuests(): Promise<Quest[]> {
  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ requiredLevel: 'asc' }, { difficulty: 'asc' }],
  });
  return quests as Quest[];
}

export async function findQuestById(
  questId: string
): Promise<QuestWithQuestions | null> {
  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
        include: {
          answerOptions: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  });
  return quest as QuestWithQuestions | null;
}

export async function createPlaySession(params: {
  userId: string;
  questId: string;
  totalQuestions: number;
}): Promise<PlaySession> {
  const session = await prisma.playSession.create({
    data: {
      userId: params.userId,
      questId: params.questId,
      status: SessionStatus.IN_PROGRESS,
      totalQuestions: params.totalQuestions,
    },
  });
  return session as PlaySession;
}

export async function findPlaySession(
  sessionId: string
): Promise<PlaySession | null> {
  const session = await prisma.playSession.findUnique({
    where: { id: sessionId },
  });
  return session as PlaySession | null;
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
  await prisma.$transaction([
    prisma.questionAnswer.create({
      data: {
        playSessionId: params.playSessionId,
        questionId: params.questionId,
        selectedOptionId: params.selectedOptionId,
        isCorrect: params.isCorrect,
        xpEarned: params.xpEarned,
        responseTimeMs: params.responseTimeMs,
        comboCountAtAnswer: params.comboCountAtAnswer,
      },
    }),
    prisma.playSession.update({
      where: { id: params.playSessionId },
      data: {
        totalXpEarned: { increment: params.xpEarned },
        correctAnswers: params.isCorrect ? { increment: 1 } : undefined,
      },
    }),
  ]);
}

export async function updateSessionMaxCombo(
  sessionId: string,
  combo: number
): Promise<void> {
  const session = await prisma.playSession.findUnique({
    where: { id: sessionId },
    select: { maxCombo: true },
  });
  if (session && combo > session.maxCombo) {
    await prisma.playSession.update({
      where: { id: sessionId },
      data: { maxCombo: combo },
    });
  }
}

export async function completePlaySession(
  sessionId: string
): Promise<PlaySession> {
  const session = await prisma.playSession.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.COMPLETED,
      completedAt: new Date(),
    },
  });
  return session as PlaySession;
}

export async function getAnswerCount(sessionId: string): Promise<number> {
  return prisma.questionAnswer.count({
    where: { playSessionId: sessionId },
  });
}

export async function getCurrentCombo(sessionId: string): Promise<number> {
  const answers = await prisma.questionAnswer.findMany({
    where: { playSessionId: sessionId },
    orderBy: { createdAt: 'desc' },
    select: { isCorrect: true },
  });
  let combo = 0;
  for (const a of answers) {
    if (!a.isCorrect) break;
    combo++;
  }
  return combo;
}
