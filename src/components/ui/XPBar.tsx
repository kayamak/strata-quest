type XPBarProps = {
  currentXp: number;
  levelXp: number;
  nextLevelXp: number;
  level: number;
};

export default function XPBar({
  currentXp,
  levelXp,
  nextLevelXp,
  level,
}: XPBarProps) {
  const progress =
    nextLevelXp > levelXp
      ? Math.min(((currentXp - levelXp) / (nextLevelXp - levelXp)) * 100, 100)
      : 100;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-indigo-700">Lv {level}</span>
        <span className="text-slate-500">
          {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
