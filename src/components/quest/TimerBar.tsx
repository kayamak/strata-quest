'use client';

import { useEffect, useRef, useState } from 'react';

type TimerBarProps = {
  timeLimitSeconds: number;
  onTimeUp: () => void;
  running: boolean;
};

export default function TimerBar({
  timeLimitSeconds,
  onTimeUp,
  running,
}: TimerBarProps) {
  const [remaining, setRemaining] = useState(timeLimitSeconds * 1000);
  const [prevTimeLimitSeconds, setPrevTimeLimitSeconds] = useState(timeLimitSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  // タイムリミットが変わったらレンダー中にリセット（useEffect内でのsetState回避）
  if (prevTimeLimitSeconds !== timeLimitSeconds) {
    setPrevTimeLimitSeconds(timeLimitSeconds);
    setRemaining(timeLimitSeconds * 1000);
  }

  useEffect(() => {
    // timeLimitSeconds 変化時 or running 変化時に ref をリセット
    elapsedRef.current = 0;
    startTimeRef.current = null;

    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current + elapsedRef.current;
      const rem = Math.max(timeLimitSeconds * 1000 - elapsed, 0);
      setRemaining(rem);
      if (rem <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onTimeUp();
      }
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, timeLimitSeconds, onTimeUp]);

  const percent = (remaining / (timeLimitSeconds * 1000)) * 100;
  const isWarning = percent < 30;

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>残り時間</span>
        <span className={isWarning ? 'font-bold text-red-500' : ''}>
          {Math.ceil(remaining / 1000)}秒
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={[
            'h-full rounded-full transition-all',
            isWarning ? 'bg-red-500' : 'bg-green-500',
          ].join(' ')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
