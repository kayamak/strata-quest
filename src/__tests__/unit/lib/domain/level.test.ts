import { describe, it, expect } from 'vitest';
import { getLevelFromXp, getXpForLevel } from '@/lib/domain/level';

describe('getLevelFromXp', () => {
  it('XP=0 のとき Lv1', () => {
    expect(getLevelFromXp(0)).toBe(1);
  });

  it('XP=99 のとき Lv1（Lv2には100必要）', () => {
    expect(getLevelFromXp(99)).toBe(1);
  });

  it('XP=100 のとき Lv2', () => {
    expect(getLevelFromXp(100)).toBe(2);
  });

  it('XP=399 のとき Lv2（Lv3には累計400必要）', () => {
    expect(getLevelFromXp(399)).toBe(2);
  });

  it('XP=400 のとき Lv3', () => {
    expect(getLevelFromXp(400)).toBe(3);
  });

  it('XP=999 のとき Lv3（Lv4には累計1000必要）', () => {
    expect(getLevelFromXp(999)).toBe(3);
  });

  it('XP=1000 のとき Lv4', () => {
    expect(getLevelFromXp(1000)).toBe(4);
  });

  it('境界値テーブル検証', () => {
    // C(L) = 50*(L-1)*L*(L+1)/3
    const cases = [
      { xp: 0, level: 1 },
      { xp: 100, level: 2 }, // C(2)=100
      { xp: 400, level: 3 }, // C(3)=400
      { xp: 1000, level: 4 }, // C(4)=1000
      { xp: 2000, level: 5 }, // C(5)=2000
      { xp: 3500, level: 6 }, // C(6)=3500
      { xp: 5600, level: 7 }, // C(7)=5600
      { xp: 8400, level: 8 }, // C(8)=8400
      { xp: 12000, level: 9 }, // C(9)=12000
      { xp: 16500, level: 10 }, // C(10)=16500
    ];
    for (const { xp, level } of cases) {
      expect(getLevelFromXp(xp)).toBe(level);
    }
  });
});

describe('getXpForLevel', () => {
  it('Lv1: current=0, required=100', () => {
    expect(getXpForLevel(1)).toEqual({ current: 0, required: 100 });
  });

  it('Lv2: current=100, required=400', () => {
    expect(getXpForLevel(2)).toEqual({ current: 100, required: 400 });
  });

  it('Lv3: current=400, required=1000', () => {
    expect(getXpForLevel(3)).toEqual({ current: 400, required: 1000 });
  });

  it('Lv4: current=1000, required=2000', () => {
    expect(getXpForLevel(4)).toEqual({ current: 1000, required: 2000 });
  });

  it('Lv10: current=16500, required=22000', () => {
    // C(10)=50*9*10*11/3=16500, C(11)=50*10*11*12/3=22000
    expect(getXpForLevel(10)).toEqual({ current: 16500, required: 22000 });
  });
});
