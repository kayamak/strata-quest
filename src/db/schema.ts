import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// ============================
// NextAuth テーブル
// ============================

export const users = sqliteTable('User', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: integer('emailVerified', { mode: 'timestamp' }),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  uniqueIndex('User_email_key').on(table.email),
]);

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  playerProfile: one(playerProfiles, {
    fields: [users.id],
    references: [playerProfiles.userId],
  }),
  vocabularyUnlocks: many(vocabularyUnlocks),
  playSessions: many(playSessions),
}));

export const accounts = sqliteTable('Account', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => [
  uniqueIndex('Account_provider_providerAccountId_key').on(table.provider, table.providerAccountId),
]);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessions = sqliteTable('Session', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text('sessionToken').notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('Session_sessionToken_key').on(table.sessionToken),
]);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const verificationTokens = sqliteTable('VerificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('VerificationToken_token_key').on(table.token),
  uniqueIndex('VerificationToken_identifier_token_key').on(table.identifier, table.token),
]);

// ============================
// ゲームエンティティ
// ============================

export const playerProfiles = sqliteTable('PlayerProfile', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  level: integer('level').notNull().default(1),
  totalXp: integer('totalXp').notNull().default(0),
  abstractPower: integer('abstractPower').notNull().default(0),
  specificPower: integer('specificPower').notNull().default(0),
  structureSense: integer('structureSense').notNull().default(0),
  vocabularyLevel: integer('vocabularyLevel').notNull().default(0),
  currentHp: integer('currentHp').notNull().default(100),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  uniqueIndex('PlayerProfile_userId_key').on(table.userId),
]);

export const playerProfilesRelations = relations(playerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
}));

export const vocabularyNodes = sqliteTable('VocabularyNode', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  word: text('word').notNull(),
  japaneseMeaning: text('japaneseMeaning').notNull(),
  definition: text('definition').notNull(),
  abstractionLevel: integer('abstractionLevel').notNull(),
  difficulty: integer('difficulty').notNull(),
  parentId: text('parentId').references((): any => vocabularyNodes.id),
  requiredPlayerLevel: integer('requiredPlayerLevel').notNull().default(1),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  uniqueIndex('VocabularyNode_word_key').on(table.word),
]);

export const vocabularyNodesRelations = relations(vocabularyNodes, ({ one, many }) => ({
  parent: one(vocabularyNodes, {
    fields: [vocabularyNodes.parentId],
    references: [vocabularyNodes.id],
    relationName: 'VocabularyHierarchy',
  }),
  children: many(vocabularyNodes, {
    relationName: 'VocabularyHierarchy',
  }),
  unlocks: many(vocabularyUnlocks),
  questions: many(questions),
}));

export const vocabularyUnlocks = sqliteTable('VocabularyUnlock', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  vocabularyNodeId: text('vocabularyNodeId').notNull().references(() => vocabularyNodes.id, { onDelete: 'cascade' }),
  unlockedAt: integer('unlockedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  uniqueIndex('VocabularyUnlock_userId_vocabularyNodeId_key').on(table.userId, table.vocabularyNodeId),
]);

export const vocabularyUnlocksRelations = relations(vocabularyUnlocks, ({ one }) => ({
  user: one(users, {
    fields: [vocabularyUnlocks.userId],
    references: [users.id],
  }),
  vocabularyNode: one(vocabularyNodes, {
    fields: [vocabularyUnlocks.vocabularyNodeId],
    references: [vocabularyNodes.id],
  }),
}));

export const quests = sqliteTable('Quest', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  questType: text('questType').notNull(),
  requiredLevel: integer('requiredLevel').notNull().default(1),
  difficulty: integer('difficulty').notNull(),
  baseXpReward: integer('baseXpReward').notNull(),
  questionCount: integer('questionCount').notNull(),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const questsRelations = relations(quests, ({ many }) => ({
  questions: many(questions),
  playSessions: many(playSessions),
}));

export const questions = sqliteTable('Question', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  questId: text('questId').notNull().references(() => quests.id, { onDelete: 'cascade' }),
  questionText: text('questionText').notNull(),
  questionType: text('questionType').notNull(),
  targetVocabularyId: text('targetVocabularyId').notNull().references(() => vocabularyNodes.id),
  explanation: text('explanation').notNull(),
  sortOrder: integer('sortOrder').notNull(),
  timeLimitSeconds: integer('timeLimitSeconds').notNull().default(30),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quest: one(quests, {
    fields: [questions.questId],
    references: [quests.id],
  }),
  targetVocabulary: one(vocabularyNodes, {
    fields: [questions.targetVocabularyId],
    references: [vocabularyNodes.id],
  }),
  answerOptions: many(answerOptions),
  questionAnswers: many(questionAnswers),
}));

export const answerOptions = sqliteTable('AnswerOption', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  questionId: text('questionId').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  isCorrect: integer('isCorrect', { mode: 'boolean' }).notNull(),
  vocabularyNodeId: text('vocabularyNodeId'),
  sortOrder: integer('sortOrder').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const answerOptionsRelations = relations(answerOptions, ({ one, many }) => ({
  question: one(questions, {
    fields: [answerOptions.questionId],
    references: [questions.id],
  }),
  questionAnswers: many(questionAnswers),
}));

export const playSessions = sqliteTable('PlaySession', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questId: text('questId').notNull().references(() => quests.id),
  status: text('status').notNull().default('IN_PROGRESS'),
  totalXpEarned: integer('totalXpEarned').notNull().default(0),
  correctAnswers: integer('correctAnswers').notNull().default(0),
  totalQuestions: integer('totalQuestions').notNull(),
  maxCombo: integer('maxCombo').notNull().default(0),
  startedAt: integer('startedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  completedAt: integer('completedAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const playSessionsRelations = relations(playSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [playSessions.userId],
    references: [users.id],
  }),
  quest: one(quests, {
    fields: [playSessions.questId],
    references: [quests.id],
  }),
  questionAnswers: many(questionAnswers),
}));

export const questionAnswers = sqliteTable('QuestionAnswer', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  playSessionId: text('playSessionId').notNull().references(() => playSessions.id, { onDelete: 'cascade' }),
  questionId: text('questionId').notNull().references(() => questions.id),
  selectedOptionId: text('selectedOptionId').references(() => answerOptions.id, { onDelete: 'set null' }),
  isCorrect: integer('isCorrect', { mode: 'boolean' }).notNull(),
  xpEarned: integer('xpEarned').notNull(),
  responseTimeMs: integer('responseTimeMs').notNull(),
  comboCountAtAnswer: integer('comboCountAtAnswer').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const questionAnswersRelations = relations(questionAnswers, ({ one }) => ({
  playSession: one(playSessions, {
    fields: [questionAnswers.playSessionId],
    references: [playSessions.id],
  }),
  question: one(questions, {
    fields: [questionAnswers.questionId],
    references: [questions.id],
  }),
  selectedOption: one(answerOptions, {
    fields: [questionAnswers.selectedOptionId],
    references: [answerOptions.id],
  }),
}));
