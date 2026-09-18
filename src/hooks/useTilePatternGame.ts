import { useCallback, useState } from 'react';
import {
  applyRoundResult,
  readTilePatternProgress,
  writeTilePatternProgress,
  type RoundResult,
  type TilePatternProgress,
} from '../data/tilePatternGame';

export function useTilePatternGame(patientId: string) {
  const [progress, setProgress] = useState<TilePatternProgress>(() =>
    readTilePatternProgress(patientId),
  );

  const recordResult = useCallback(
    (result: RoundResult, elapsedSeconds: number): TilePatternProgress => {
      const next = applyRoundResult(progress, result, elapsedSeconds);
      setProgress(next);
      writeTilePatternProgress(patientId, next);
      return next;
    },
    [progress, patientId],
  );

  return { progress, recordResult };
}
