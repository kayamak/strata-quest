/**
 * レベルからHP最大値を計算する
 */
export function getMaxHp(level: number): number {
  return level * 100;
}

/**
 * 復活時に消費するXP（レベル * 100）
 */
export function getRevivalXpCost(level: number): number {
  return level * 100;
}
