import type { XpForLevel } from '@/types';

/**
 * レベルLに達するために必要な累計XP
 * 各レベルアップ費用: n*(n+1)/2 * 100 (Lv1→2:100, Lv2→3:300, Lv3→4:600...)
 * 累計 C(L) = 50 * (L-1) * L * (L+1) / 3
 */
function cumXpToReachLevel(level: number): number {
  return (50 * (level - 1) * level * (level + 1)) / 3;
}

/**
 * 累計XPからプレイヤーレベルを計算する
 */
export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  while (true) {
    const nextLevelThreshold = cumXpToReachLevel(level + 1);
    if (totalXp < nextLevelThreshold) break;
    level++;
  }
  return level;
}

/**
 * 指定レベルの現在レベル開始累計XPと次レベルに必要な累計XPを返す
 */
export function getXpForLevel(level: number): XpForLevel {
  return {
    current: cumXpToReachLevel(level),
    required: cumXpToReachLevel(level + 1),
  };
}
