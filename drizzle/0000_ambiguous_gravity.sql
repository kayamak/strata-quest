CREATE TABLE `Account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Account_provider_providerAccountId_key` ON `Account` (`provider`,`providerAccountId`);--> statement-breakpoint
CREATE TABLE `AnswerOption` (
	`id` text PRIMARY KEY NOT NULL,
	`questionId` text NOT NULL,
	`text` text NOT NULL,
	`isCorrect` integer NOT NULL,
	`vocabularyNodeId` text,
	`sortOrder` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `PlaySession` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`questId` text NOT NULL,
	`status` text DEFAULT 'IN_PROGRESS' NOT NULL,
	`totalXpEarned` integer DEFAULT 0 NOT NULL,
	`correctAnswers` integer DEFAULT 0 NOT NULL,
	`totalQuestions` integer NOT NULL,
	`maxCombo` integer DEFAULT 0 NOT NULL,
	`startedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`completedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`questId`) REFERENCES `Quest`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `PlayerProfile` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`totalXp` integer DEFAULT 0 NOT NULL,
	`abstractPower` integer DEFAULT 0 NOT NULL,
	`specificPower` integer DEFAULT 0 NOT NULL,
	`structureSense` integer DEFAULT 0 NOT NULL,
	`vocabularyLevel` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `PlayerProfile_userId_key` ON `PlayerProfile` (`userId`);--> statement-breakpoint
CREATE TABLE `QuestionAnswer` (
	`id` text PRIMARY KEY NOT NULL,
	`playSessionId` text NOT NULL,
	`questionId` text NOT NULL,
	`selectedOptionId` text,
	`isCorrect` integer NOT NULL,
	`xpEarned` integer NOT NULL,
	`responseTimeMs` integer NOT NULL,
	`comboCountAtAnswer` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`playSessionId`) REFERENCES `PlaySession`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`selectedOptionId`) REFERENCES `AnswerOption`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Question` (
	`id` text PRIMARY KEY NOT NULL,
	`questId` text NOT NULL,
	`questionText` text NOT NULL,
	`questionType` text NOT NULL,
	`targetVocabularyId` text NOT NULL,
	`explanation` text NOT NULL,
	`sortOrder` integer NOT NULL,
	`timeLimitSeconds` integer DEFAULT 30 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`questId`) REFERENCES `Quest`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`targetVocabularyId`) REFERENCES `VocabularyNode`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Quest` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`questType` text NOT NULL,
	`requiredLevel` integer DEFAULT 1 NOT NULL,
	`difficulty` integer NOT NULL,
	`baseXpReward` integer NOT NULL,
	`questionCount` integer NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Session_sessionToken_key` ON `Session` (`sessionToken`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);--> statement-breakpoint
CREATE TABLE `VerificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `VerificationToken_token_key` ON `VerificationToken` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `VerificationToken_identifier_token_key` ON `VerificationToken` (`identifier`,`token`);--> statement-breakpoint
CREATE TABLE `VocabularyNode` (
	`id` text PRIMARY KEY NOT NULL,
	`word` text NOT NULL,
	`japaneseMeaning` text NOT NULL,
	`definition` text NOT NULL,
	`abstractionLevel` integer NOT NULL,
	`difficulty` integer NOT NULL,
	`parentId` text,
	`requiredPlayerLevel` integer DEFAULT 1 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`parentId`) REFERENCES `VocabularyNode`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `VocabularyNode_word_key` ON `VocabularyNode` (`word`);--> statement-breakpoint
CREATE TABLE `VocabularyUnlock` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`vocabularyNodeId` text NOT NULL,
	`unlockedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vocabularyNodeId`) REFERENCES `VocabularyNode`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `VocabularyUnlock_userId_vocabularyNodeId_key` ON `VocabularyUnlock` (`userId`,`vocabularyNodeId`);