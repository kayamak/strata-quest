'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { VocabularyNode } from '@/types';

type LevelUpModalProps = {
  isOpen: boolean;
  newLevel: number;
  unlockedVocabulary: VocabularyNode[];
  onClose: () => void;
};

export default function LevelUpModal({
  isOpen,
  newLevel,
  unlockedVocabulary,
  onClose,
}: LevelUpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-4xl shadow-lg">
          ⬆
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-800">Level Up!</h2>
        <p className="mb-4 text-4xl font-extrabold text-indigo-600">
          Lv {newLevel}
        </p>

        {unlockedVocabulary.length > 0 && (
          <div className="mb-4 rounded-xl bg-indigo-50 p-4 text-left">
            <p className="mb-2 text-sm font-medium text-indigo-700">
              新しい語彙が解放されました！
            </p>
            <ul className="space-y-1">
              {unlockedVocabulary.map((v) => (
                <li key={v.id} className="text-sm text-slate-700">
                  <span className="font-bold">{v.word}</span>{' '}
                  <span className="text-slate-500">— {v.japaneseMeaning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={onClose} className="w-full">
          続ける
        </Button>
      </div>
    </Modal>
  );
}
