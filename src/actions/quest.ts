'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  findQuestById,
  createPlaySession,
  findPlaySession,
  recordQuestionAnswer,
  updateSessionMaxCombo,
  completePlaySession,
  getCurrentCombo,
  getAnswerCount,
} from '@/lib/db/quest';
import {
  findOrCreatePlayerProfile,
  updatePlayerXpAndLevel,
  updatePlayerStats,
} from '@/lib/db/player';
import {
  getUnlockedVocabularyIds,
  createVocabularyUnlocks,
  findVocabularyToUnlock,
} from '@/lib/db/vocabulary';
import { calculateXp } from '@/lib/domain/xp';
import { getLevelFromXp } from '@/lib/domain/level';
import { calculateStatDelta } from '@/lib/domain/stats';
import { AppError, QuestType } from '@/types';
import type {
  StartPlaySessionResult,
  SubmitAnswerInput,
  AnswerResult,
  CompleteQuestInput,
  QuestCompletionResult,
} from '@/types';
import { prisma } from '@/lib/prisma';

export async function startPlaySession(
  questId: string
): Promise<StartPlaySessionResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  const userId = session.user.id;

  const quest = await findQuestById(questId);
  if (!quest) {
    throw new AppError('Quest not found', 'QUEST_NOT_FOUND');
  }
  if (!quest.isActive) {
    throw new AppError('Quest is not active', 'QUEST_INACTIVE');
  }

  const profile = await findOrCreatePlayerProfile(userId);
  if (profile.level < quest.requiredLevel) {
    throw new AppError('Player level too low', 'LEVEL_REQUIRED');
  }

  const playSession = await createPlaySession({
    userId,
    questId,
    totalQuestions: quest.questions.length,
  });

  return {
    playSessionId: playSession.id,
    questions: quest.questions,
  };
}

export async function submitAnswer(
  input: SubmitAnswerInput
): Promise<AnswerResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  const userId = session.user.id;

  const playSession = await findPlaySession(input.playSessionId);
  if (!playSession) {
    throw new AppError('Play session not found', 'SESSION_NOT_FOUND');
  }
  if (playSession.userId !== userId) {
    throw new AppError('Unauthorized', 'UNAUTHORIZED');
  }
  if (playSession.status !== 'IN_PROGRESS') {
    throw new AppError('Session is not in progress', 'SESSION_INVALID');
  }

  // 選択肢と問題の情報を取得
  const question = await prisma.question.findUnique({
    where: { id: input.questionId },
    include: {
      answerOptions: true,
      targetVocabulary: true,
      quest: { select: { baseXpReward: true, questType: true } },
    },
  });
  if (!question) {
    throw new AppError('Question not found', 'QUESTION_NOT_FOUND');
  }

  const selectedOption = question.answerOptions.find(
    (o) => o.id === input.selectedOptionId
  );
  const correctOption = question.answerOptions.find((o) => o.isCorrect);
  if (!correctOption) {
    throw new AppError('No correct option found', 'DATA_ERROR');
  }

  const isCorrect = selectedOption?.isCorrect ?? false;
  const currentCombo = await getCurrentCombo(input.playSessionId);
  const newCombo = isCorrect ? currentCombo + 1 : 0;

  const xpEarned = calculateXp({
    baseXp: question.quest.baseXpReward,
    questionDifficulty: question.targetVocabulary.difficulty,
    isCorrect,
    responseTimeMs: input.responseTimeMs,
    timeLimitMs: question.timeLimitSeconds * 1000,
    comboCount: currentCombo,
  });

  await recordQuestionAnswer({
    playSessionId: input.playSessionId,
    questionId: input.questionId,
    selectedOptionId: selectedOption ? selectedOption.id : null,
    isCorrect,
    xpEarned,
    responseTimeMs: input.responseTimeMs,
    comboCountAtAnswer: currentCombo,
  });

  await updateSessionMaxCombo(input.playSessionId, newCombo);

  // ステータス更新
  const statDelta = calculateStatDelta({
    questType: question.quest.questType as QuestType,
    isCorrect,
    abstractionLevel: question.targetVocabulary.abstractionLevel,
  });
  await updatePlayerStats({
    userId,
    ...statDelta,
  });

  return {
    isCorrect,
    xpEarned,
    correctOptionId: correctOption.id,
    explanation: question.explanation,
    currentCombo: newCombo,
  };
}

export async function completeQuest(
  input: CompleteQuestInput
): Promise<QuestCompletionResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  const userId = session.user.id;

  const playSession = await findPlaySession(input.playSessionId);
  if (!playSession) {
    throw new AppError('Play session not found', 'SESSION_NOT_FOUND');
  }
  if (playSession.userId !== userId) {
    throw new AppError('Unauthorized', 'UNAUTHORIZED');
  }

  // 全問回答済みか確認
  const answerCount = await getAnswerCount(input.playSessionId);
  if (answerCount < playSession.totalQuestions) {
    throw new AppError('Not all questions answered', 'INCOMPLETE');
  }

  await completePlaySession(input.playSessionId);

  const profile = await findOrCreatePlayerProfile(userId);
  const previousLevel = profile.level;
  const newTotalXp = profile.totalXp + playSession.totalXpEarned;
  const newLevel = getLevelFromXp(newTotalXp);

  await updatePlayerXpAndLevel({
    userId,
    addXp: playSession.totalXpEarned,
    newLevel,
  });

  // 解放する語彙を決定
  const questWithQuestions = await findQuestById(playSession.questId);
  const questVocabularyIds =
    questWithQuestions?.questions.map((q) => q.targetVocabularyId) ?? [];

  const alreadyUnlockedIds = await getUnlockedVocabularyIds(userId);
  const toUnlock = await findVocabularyToUnlock(
    newLevel,
    alreadyUnlockedIds,
    questVocabularyIds
  );

  await createVocabularyUnlocks(
    userId,
    toUnlock.map((v) => v.id)
  );

  return {
    totalXpEarned: playSession.totalXpEarned,
    correctAnswers: playSession.correctAnswers,
    totalQuestions: playSession.totalQuestions,
    levelUp: newLevel > previousLevel,
    previousLevel,
    newLevel,
    unlockedVocabulary: toUnlock,
  };
}
