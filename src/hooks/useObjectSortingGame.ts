import { useCallback, useState } from 'react';
import {
  applyRoundResult,
  readObjectSortingProgress,
  writeObjectSortingProgress,
  type ObjectSortingProgress,
  type RoundResult,
} from '../data/objectSortingGame';

export function useObjectSortingGame(patientId: string) {
  const [progress, setProgress] = useState<ObjectSortingProgress>(() =>
    readObjectSortingProgress(patientId),
  );

  const recordResult = useCallback(
    (result: RoundResult): ObjectSortingProgress => {
      const next = applyRoundResult(progress, result);
      setProgress(next);
      writeObjectSortingProgress(patientId, next);
      return next;
    },
    [progress, patientId],
  );

  return { progress, recordResult };
}
