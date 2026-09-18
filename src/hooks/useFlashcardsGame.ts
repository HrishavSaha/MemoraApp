import { useCallback, useState } from 'react';
import {
  applyCardResult,
  readFlashcardsProgress,
  writeFlashcardsProgress,
  type CardResult,
  type FlashcardsProgress,
} from '../data/flashcardsGame';

export function useFlashcardsGame(patientId: string) {
  const [progress, setProgress] = useState<FlashcardsProgress>(() =>
    readFlashcardsProgress(patientId),
  );

  const recordResult = useCallback(
    (result: CardResult): FlashcardsProgress => {
      const next = applyCardResult(progress, result);
      setProgress(next);
      writeFlashcardsProgress(patientId, next);
      return next;
    },
    [progress, patientId],
  );

  return { progress, recordResult };
}
