import type { XpCalculationInput } from '@/types';

export function calculateXp(input: XpCalculationInput): number {
  if (!input.isCorrect) return 0;

  // ステップ1: 基本XP（語彙難易度に基づく）
  // difficulty 1→0.6, 2→0.7, 3→0.8, 4→0.9, 5→1.0
  const difficultyMultiplier = 0.6 + (input.questionDifficulty - 1) * 0.1;
  const baseScore = input.baseXp * difficultyMultiplier;

  // ステップ2: スピードボーナス
  const timeRatio = input.responseTimeMs / input.timeLimitMs;
  const speedMultiplier =
    timeRatio <= 0.3
      ? 1.3 // 制限時間の30%以内: +30%
      : timeRatio <= 0.6
        ? 1.15 // 制限時間の60%以内: +15%
        : 1.0; // それ以外: ボーナスなし

  // ステップ3: コンボボーナス（最大+50%）
  const comboBonus = Math.min(input.comboCount * 0.05, 0.5);
  const comboMultiplier = 1 + comboBonus;

  return Math.floor(baseScore * speedMultiplier * comboMultiplier);
}
