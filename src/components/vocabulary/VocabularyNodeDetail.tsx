'use client';

import React from 'react';
import type { VocabularyNode } from '@/types';

interface VocabularyNodeDetailProps {
  node: VocabularyNode;
  isUnlocked: boolean;
}

export function VocabularyNodeDetail({
  node,
  isUnlocked,
}: VocabularyNodeDetailProps) {
  if (!isUnlocked) {
    return (
      <div className="p-4 border rounded-lg bg-slate-50 text-slate-500 text-center">
        <h3 className="text-lg font-bold mb-2">???</h3>
        <p className="text-sm">解放条件: レベル {node.requiredPlayerLevel}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-indigo-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-bold text-indigo-800 mb-1">{node.word}</h3>
      <p className="text-md font-semibold text-slate-700 mb-3">
        {node.japaneseMeaning}
      </p>
      <div className="text-sm text-slate-600 space-y-1">
        <p>
          <strong>定義:</strong> {node.definition}
        </p>
        <p>
          <strong>抽象度:</strong> {node.abstractionLevel}/10
        </p>
        <p>
          <strong>難易度:</strong> {node.difficulty}/5
        </p>
      </div>
    </div>
  );
}
