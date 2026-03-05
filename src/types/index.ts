// 列挙型（const + typeof パターン）

export const QuestType = {
  GENERALIZE: 'GENERALIZE',
  SPECIFY: 'SPECIFY',
  COMMON_CONCEPT: 'COMMON_CONCEPT',
  ABSTRACT_RALLY: 'ABSTRACT_RALLY',
} as const;
export type QuestType = (typeof QuestType)[keyof typeof QuestType];

export const QuestionType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  INPUT: 'INPUT',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export const SessionStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

// エンティティ型

export type PlayerProfile = {
  id: string;
  userId: string;
  level: number;
  totalXp: number;
  abstractPower: number;
  specificPower: number;
  structureSense: number;
  vocabularyLevel: number;
  createdAt: Date;
  updatedAt: Date;
};

export type VocabularyNode = {
  id: string;
  word: string;
  japaneseMeaning: string;
  definition: string;
  abstractionLevel: number;
  difficulty: number;
  parentId: string | null;
  requiredPlayerLevel: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  questType: QuestType;
  requiredLevel: number;
  difficulty: number;
  baseXpReward: number;
  questionCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Question = {
  id: string;
  questId: string;
  questionText: string;
  questionType: QuestionType;
  targetVocabularyId: string;
  explanation: string;
  sortOrder: number;
  timeLimitSeconds: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AnswerOption = {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  vocabularyNodeId: string | null;
  sortOrder: number;
  createdAt: Date;
};

export type PlaySession = {
  id: string;
  userId: string;
  questId: string;
  status: SessionStatus;
  totalXpEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  maxCombo: number;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type QuestionAnswer = {
  id: string;
  playSessionId: string;
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  xpEarned: number;
  responseTimeMs: number;
  comboCountAtAnswer: number;
  createdAt: Date;
};

// Server Action 入出力型

export type SubmitAnswerInput = {
  playSessionId: string;
  questionId: string;
  selectedOptionId: string;
  responseTimeMs: number;
};

export type AnswerResult = {
  isCorrect: boolean;
  xpEarned: number;
  correctOptionId: string;
  explanation: string;
  currentCombo: number;
};

export type StartPlaySessionInput = {
  questId: string;
};

export type StartPlaySessionResult = {
  playSessionId: string;
  questions: (Question & { answerOptions: AnswerOption[] })[];
};

export type CompleteQuestInput = {
  playSessionId: string;
};

export type QuestCompletionResult = {
  totalXpEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  levelUp: boolean;
  previousLevel: number;
  newLevel: number;
  unlockedVocabulary: VocabularyNode[];
};

export type PlayHistoryItem = {
  id: string;
  questTitle: string;
  correctAnswers: number;
  totalQuestions: number;
  totalXpEarned: number;
  completedAt: Date | null;
  startedAt: Date;
};

// XP・レベル計算用型

export type XpCalculationInput = {
  baseXp: number;
  questionDifficulty: number;
  isCorrect: boolean;
  responseTimeMs: number;
  timeLimitMs: number;
  comboCount: number;
};

export type StatUpdateInput = {
  questType: QuestType;
  isCorrect: boolean;
  abstractionLevel: number;
};

export type StatDelta = {
  abstractPower: number;
  specificPower: number;
  structureSense: number;
  vocabularyLevel: number;
};

export type XpForLevel = {
  current: number;
  required: number;
};

// カスタムエラークラス

export class AppError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
