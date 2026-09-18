import { storage } from '../storage/mmkv';

export type TilePatternProgress = {
  gridSize: number;
  patternLength: number;
  consecutiveWins: number;
  consecutiveLosses: number;
};

export type RoundResult = 'win' | 'loss';

const KEY_PREFIX = '@memora/games/tilePattern/';

export const MIN_GRID_SIZE = 2;
export const MIN_PATTERN_LENGTH = 3;
export const MAX_PATTERN_LENGTH = 6;
export const FAST_WIN_SECONDS = 20;

const WINS_TO_LEVEL_UP = 3;
const LOSSES_TO_LEVEL_DOWN = 3;

const DEFAULT_PROGRESS: TilePatternProgress = {
  gridSize: MIN_GRID_SIZE,
  patternLength: MIN_PATTERN_LENGTH,
  consecutiveWins: 0,
  consecutiveLosses: 0,
};

export function readTilePatternProgress(
  patientId: string,
): TilePatternProgress {
  const raw = storage.getString(KEY_PREFIX + patientId);
  if (raw) {
    try {
      return JSON.parse(raw) as TilePatternProgress;
    } catch {
      // Corrupt value — fall through and reseed.
    }
  }
  storage.set(KEY_PREFIX + patientId, JSON.stringify(DEFAULT_PROGRESS));
  return DEFAULT_PROGRESS;
}

export function writeTilePatternProgress(
  patientId: string,
  progress: TilePatternProgress,
) {
  storage.set(KEY_PREFIX + patientId, JSON.stringify(progress));
}

/**
 * Pure leveling rules, kept separate from storage/UI so the progression
 * logic (win/loss streaks, grid vs. pattern-length scaling) can be reasoned
 * about and tested on its own.
 */
export function applyRoundResult(
  progress: TilePatternProgress,
  result: RoundResult,
  elapsedSeconds: number,
): TilePatternProgress {
  if (result === 'win') {
    const consecutiveWins = progress.consecutiveWins + 1;
    const wonFast = elapsedSeconds < FAST_WIN_SECONDS;
    const shouldLevelUp = wonFast || consecutiveWins >= WINS_TO_LEVEL_UP;

    if (!shouldLevelUp) {
      return { ...progress, consecutiveWins, consecutiveLosses: 0 };
    }

    if (progress.patternLength >= MAX_PATTERN_LENGTH) {
      return {
        gridSize: progress.gridSize + 1,
        patternLength: MIN_PATTERN_LENGTH,
        consecutiveWins: 0,
        consecutiveLosses: 0,
      };
    }

    return {
      ...progress,
      patternLength: progress.patternLength + 1,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    };
  }

  const consecutiveLosses = progress.consecutiveLosses + 1;
  if (consecutiveLosses < LOSSES_TO_LEVEL_DOWN) {
    return { ...progress, consecutiveLosses, consecutiveWins: 0 };
  }

  if (progress.patternLength <= MIN_PATTERN_LENGTH) {
    return {
      gridSize: Math.max(MIN_GRID_SIZE, progress.gridSize - 1),
      patternLength: MIN_PATTERN_LENGTH,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    };
  }

  return {
    ...progress,
    patternLength: progress.patternLength - 1,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  };
}

/** Random tile sequence, never repeating the same tile twice in a row. */
export function generatePattern(
  gridSize: number,
  patternLength: number,
): number[] {
  const tileCount = gridSize * gridSize;
  const pattern: number[] = [];
  for (let i = 0; i < patternLength; i++) {
    let next = Math.floor(Math.random() * tileCount);
    if (pattern.length > 0 && next === pattern[pattern.length - 1]) {
      next = (next + 1) % tileCount;
    }
    pattern.push(next);
  }
  return pattern;
}
