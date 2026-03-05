import { describe, it, expect } from 'vitest';
import { calculateStatDelta } from '@/lib/domain/stats';
import { QuestType } from '@/types';

describe('calculateStatDelta', () => {
  describe('不正解の場合はすべて0', () => {
    it('GENERALIZE + 不正解', () => {
      expect(
        calculateStatDelta({
          questType: QuestType.GENERALIZE,
          isCorrect: false,
          abstractionLevel: 9,
        })
      ).toEqual({
        abstractPower: 0,
        specificPower: 0,
        structureSense: 0,
        vocabularyLevel: 0,
      });
    });
  });

  describe('GENERALIZE クエスト', () => {
    it('正解 + abstractionLevel=3: abstractPower+2, vocabularyLevel+1', () => {
      expect(
        calculateStatDelta({
          questType: QuestType.GENERALIZE,
          isCorrect: true,
          abstractionLevel: 3,
        })
      ).toEqual({
        abstractPower: 2, // 1 * (1 + floor(3/3))=2
        specificPower: 0,
        structureSense: 0,
        vocabularyLevel: 1,
      });
    });

    it('正解 + abstractionLevel=1: abstractPower+1', () => {
      expect(
        calculateStatDelta({
          questType: QuestType.GENERALIZE,
          isCorrect: true,
          abstractionLevel: 1,
        })
      ).toEqual({
        abstractPower: 1, // 1 * (1 + 0) = 1
        specificPower: 0,
        structureSense: 0,
        vocabularyLevel: 1,
      });
    });

    it('正解 + abstractionLevel=9: abstractPower+4', () => {
      expect(
        calculateStatDelta({
          questType: QuestType.GENERALIZE,
          isCorrect: true,
          abstractionLevel: 9,
        })
      ).toEqual({
        abstractPower: 4, // 1 * (1 + floor(9/3))=4
        specificPower: 0,
        structureSense: 0,
        vocabularyLevel: 1,
      });
    });
  });

  describe('SPECIFY クエスト', () => {
    it('正解 + abstractionLevel=6: specificPower+3', () => {
      expect(
        calculateStatDelta({
          questType: QuestType.SPECIFY,
          isCorrect: true,
          abstractionLevel: 6,
        })
      ).toEqual({
        abstractPower: 0,
        specificPower: 3, // 1 * (1 + 2) = 3
        structureSense: 0,
        vocabularyLevel: 1,
      });
    });
  });

  describe('COMMON_CONCEPT クエスト', () => {
    it('正解 + abstractionLevel=5: structureSense+2', () => {
      expect(
        calculateStatDelta({
          questType: QuestType.COMMON_CONCEPT,
          isCorrect: true,
          abstractionLevel: 5,
        })
      ).toEqual({
        abstractPower: 0,
        specificPower: 0,
        structureSense: 2, // 1 * (1 + floor(5/3))=2
        vocabularyLevel: 1,
      });
    });
  });

  describe('ABSTRACT_RALLY クエスト', () => {
    it('正解: abstractPower+1（abstractionLevel=1）', () => {
      expect(
        calculateStatDelta({
          questType: QuestType.ABSTRACT_RALLY,
          isCorrect: true,
          abstractionLevel: 1,
        })
      ).toEqual({
        abstractPower: 1,
        specificPower: 0,
        structureSense: 0,
        vocabularyLevel: 1,
      });
    });
  });
});
