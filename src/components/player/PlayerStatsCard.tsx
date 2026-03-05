import XPBar from '@/components/ui/XPBar';
import { getXpForLevel } from '@/lib/domain/level';
import type { PlayerProfile } from '@/types';

type PlayerStatsCardProps = {
  profile: PlayerProfile;
};

type StatBarProps = {
  label: string;
  value: number;
  max?: number;
};

function StatBar({ label, value, max = 100 }: StatBarProps) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-700">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function PlayerStatsCard({ profile }: PlayerStatsCardProps) {
  const xpRange = getXpForLevel(profile.level);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-800">
        プレイヤーステータス
      </h2>

      <div className="mb-6">
        <XPBar
          currentXp={profile.totalXp}
          levelXp={xpRange.current}
          nextLevelXp={xpRange.required}
          level={profile.level}
        />
      </div>

      <div className="space-y-3">
        <StatBar
          label="Abstract Power（抽象化力）"
          value={profile.abstractPower}
        />
        <StatBar
          label="Specific Power（具体化力）"
          value={profile.specificPower}
        />
        <StatBar
          label="Structure Sense（階層理解力）"
          value={profile.structureSense}
        />
        <StatBar
          label="Vocabulary Level（語彙レベル）"
          value={profile.vocabularyLevel}
        />
      </div>
    </div>
  );
}
