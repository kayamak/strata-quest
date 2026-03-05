import { QuestType } from '@/types';
import type { StatUpdateInput, StatDelta } from '@/types';

/**
 * 正解・不正解・クエスト種別に基づいてステータス更新差分を計算する
 */
export function calculateStatDelta(input: StatUpdateInput): StatDelta {
  const base = input.isCorrect ? 1 : 0;
  const levelBonus = Math.floor(input.abstractionLevel / 3); // 0〜3

  return {
    abstractPower:
      input.questType === QuestType.GENERALIZE ||
      input.questType === QuestType.ABSTRACT_RALLY
        ? base * (1 + levelBonus)
        : 0,
    specificPower:
      input.questType === QuestType.SPECIFY ? base * (1 + levelBonus) : 0,
    structureSense:
      input.questType === QuestType.COMMON_CONCEPT
        ? base * (1 + levelBonus)
        : 0,
    vocabularyLevel: base * 1, // 正解ごとに+1
  };
}
