import { describe, it, expect } from 'vitest';
import { calculateXp } from '@/lib/domain/xp';
import type { XpCalculationInput } from '@/types';

// スピードボーナスなし（timeRatio=25/30 > 0.6）のベースケース
const baseInput: XpCalculationInput = {
  baseXp: 100,
  questionDifficulty: 3,
  isCorrect: true,
  responseTimeMs: 25000,
  timeLimitMs: 30000,
  comboCount: 0,
};

describe('calculateXp', () => {
  it('不正解の場合は0を返す', () => {
    expect(calculateXp({ ...baseInput, isCorrect: false })).toBe(0);
  });

  describe('難易度倍率', () => {
    it('difficulty=1 のとき倍率0.6 → 60', () => {
      const result = calculateXp({ ...baseInput, questionDifficulty: 1 });
      expect(result).toBe(60); // floor(100 * 0.6 * 1.0 * 1.0) = 60
    });

    it('difficulty=3 のとき倍率0.8 → 80', () => {
      const result = calculateXp({ ...baseInput, questionDifficulty: 3 });
      expect(result).toBe(80); // floor(100 * 0.8 * 1.0 * 1.0) = 80
    });

    it('difficulty=5 のとき倍率1.0 → 100', () => {
      const result = calculateXp({ ...baseInput, questionDifficulty: 5 });
      expect(result).toBe(100); // floor(100 * 1.0 * 1.0 * 1.0) = 100
    });
  });

  describe('スピードボーナス', () => {
    it('30%以内（9000ms/30000ms）: +30% → 130', () => {
      const result = calculateXp({
        ...baseInput,
        questionDifficulty: 5,
        responseTimeMs: 9000,
        timeLimitMs: 30000,
      });
      expect(result).toBe(130); // floor(100 * 1.0 * 1.3 * 1.0) = 130
    });

    it('60%以内（18000ms/30000ms）: +15% → 114', () => {
      // JavaScript浮動小数点: floor(100 * 1.0 * 1.15) = 114
      const result = calculateXp({
        ...baseInput,
        questionDifficulty: 5,
        responseTimeMs: 18000,
        timeLimitMs: 30000,
      });
      expect(result).toBe(Math.floor(100 * 1.15));
    });

    it('60%超（25000ms/30000ms）: ボーナスなし → 100', () => {
      const result = calculateXp({
        ...baseInput,
        questionDifficulty: 5,
        responseTimeMs: 25000,
        timeLimitMs: 30000,
      });
      expect(result).toBe(100);
    });

    it('境界値: ちょうど30%（9000ms/30000ms）はスピードボーナスあり', () => {
      const result = calculateXp({
        ...baseInput,
        questionDifficulty: 5,
        responseTimeMs: 9000,
        timeLimitMs: 30000,
      });
      expect(result).toBe(130);
    });
  });

  describe('コンボボーナス', () => {
    it('コンボ0: ボーナスなし', () => {
      const result = calculateXp({
        ...baseInput,
        questionDifficulty: 5,
        comboCount: 0,
      });
      expect(result).toBe(100);
    });

    it('コンボ2: +10% → 110', () => {
      const result = calculateXp({
        ...baseInput,
        questionDifficulty: 5,
        comboCount: 2,
      });
      expect(result).toBe(110); // floor(100 * 1.0 * 1.0 * 1.10) = 110
    });

    it('コンボ10: +50%（上限）→ 150', () => {
      const result = calculateXp({
        ...baseInput,
        questionDifficulty: 5,
        comboCount: 10,
      });
      expect(result).toBe(150); // floor(100 * 1.0 * 1.0 * 1.5) = 150
    });

    it('コンボ20: +50%（上限を超えても50%まで）→ 150', () => {
      const result = calculateXp({
        ...baseInput,
        questionDifficulty: 5,
        comboCount: 20,
      });
      expect(result).toBe(150);
    });
  });

  describe('複合計算', () => {
    it('全ボーナス最大ケース: difficulty=5, 高速, コンボ10 → 195', () => {
      const result = calculateXp({
        ...baseInput,
        questionDifficulty: 5,
        responseTimeMs: 5000,
        timeLimitMs: 30000,
        comboCount: 10,
      });
      // floor(100 * 1.0 * 1.3 * 1.5) = floor(195) = 195
      expect(result).toBe(195);
    });

    it('floor処理: 小数点以下は切り捨て', () => {
      const result = calculateXp({
        baseXp: 10,
        questionDifficulty: 3,
        isCorrect: true,
        responseTimeMs: 3000,
        timeLimitMs: 30000,
        comboCount: 1,
      });
      // floor(10 * 0.8 * 1.3 * 1.05) = floor(10.92) = 10
      expect(result).toBe(10);
    });
  });
});
