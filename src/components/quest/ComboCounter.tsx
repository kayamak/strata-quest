import React from 'react';

interface ComboCounterProps {
  combo: number;
}

export function ComboCounter({ combo }: ComboCounterProps) {
  if (combo < 2) return null;

  return (
    <div className="flex items-center space-x-1 animate-bounce">
      <span className="text-2xl font-bold text-orange-500">{combo}</span>
      <span className="text-sm font-semibold text-orange-400">COMBO!</span>
    </div>
  );
}
