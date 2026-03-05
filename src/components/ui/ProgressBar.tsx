import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  color = 'bg-blue-500',
  height = 'h-2',
  className = '',
}: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${height} ${className}`}
    >
      <div
        className={`${color} ${height} transition-all duration-300 ease-out`}
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}
