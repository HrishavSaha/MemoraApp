import { storage } from '../storage/mmkv';

export type ObjectSortingProgress = {
  objectCount: number;
  binCount: number;
  consecutiveWins: number;
  consecutiveLosses: number;
};

export type RoundResult = 'win' | 'loss';

const KEY_PREFIX = '@memora/games/objectSorting/';

export const MIN_OBJECTS = 3;
export const MAX_OBJECTS = 7;
export const MIN_BINS = 2;

const WINS_TO_LEVEL_UP = 3;
const LOSSES_TO_LEVEL_DOWN = 3;
const OBJECTS_ADDED_ON_LEVEL_UP = 2;

const DEFAULT_PROGRESS: ObjectSortingProgress = {
  objectCount: MIN_OBJECTS,
  binCount: MIN_BINS,
  consecutiveWins: 0,
  consecutiveLosses: 0,
};

export function readObjectSortingProgress(
  patientId: string,
): ObjectSortingProgress {
  const raw = storage.getString(KEY_PREFIX + patientId);
  if (raw) {
    try {
      return JSON.parse(raw) as ObjectSortingProgress;
    } catch {
      // Corrupt value — fall through and reseed.
    }
  }
  storage.set(KEY_PREFIX + patientId, JSON.stringify(DEFAULT_PROGRESS));
  return DEFAULT_PROGRESS;
}

export function writeObjectSortingProgress(
  patientId: string,
  progress: ObjectSortingProgress,
) {
  storage.set(KEY_PREFIX + patientId, JSON.stringify(progress));
}

/**
 * Pure leveling rules, kept separate from storage/UI. Object count and bin
 * count are coupled: a 3-win streak adds 2 objects, wrapping back to
 * MIN_OBJECTS and growing the bins once objects hit the cap. A 3-loss streak
 * removes 1 object, and shrinks the bins back down once that leaves objects
 * only one above the "one object per bin" floor (bins + 2).
 */
export function applyRoundResult(
  progress: ObjectSortingProgress,
  result: RoundResult,
): ObjectSortingProgress {
  if (result === 'win') {
    const consecutiveWins = progress.consecutiveWins + 1;
    if (consecutiveWins < WINS_TO_LEVEL_UP) {
      return { ...progress, consecutiveWins, consecutiveLosses: 0 };
    }

    const objectCount = progress.objectCount + OBJECTS_ADDED_ON_LEVEL_UP;
    if (objectCount >= MAX_OBJECTS) {
      return {
        objectCount: MIN_OBJECTS,
        binCount: progress.binCount + 1,
        consecutiveWins: 0,
        consecutiveLosses: 0,
      };
    }

    return {
      ...progress,
      objectCount,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    };
  }

  const consecutiveLosses = progress.consecutiveLosses + 1;
  if (consecutiveLosses < LOSSES_TO_LEVEL_DOWN) {
    return { ...progress, consecutiveLosses, consecutiveWins: 0 };
  }

  const objectCount = Math.max(MIN_OBJECTS, progress.objectCount - 1);
  const binCount =
    objectCount === progress.binCount + 2
      ? Math.max(MIN_BINS, progress.binCount - 1)
      : progress.binCount;

  return { objectCount, binCount, consecutiveWins: 0, consecutiveLosses: 0 };
}

export const OBJECT_CATEGORIES = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
  'pink',
  'teal',
] as const;

export type ObjectCategory = (typeof OBJECT_CATEGORIES)[number];

export type SortableObject = {
  id: string;
  category: ObjectCategory;
};

export type SortingRound = {
  bins: ObjectCategory[];
  objects: SortableObject[];
};

export function generateRound(
  objectCount: number,
  binCount: number,
): SortingRound {
  const bins = OBJECT_CATEGORIES.slice(0, binCount);
  const objects: SortableObject[] = Array.from(
    { length: objectCount },
    (_, index) => ({
      id: String(index),
      category: bins[Math.floor(Math.random() * bins.length)],
    }),
  );
  return { bins, objects };
}
