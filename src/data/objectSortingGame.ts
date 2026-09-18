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

export const SORTING_CATEGORIES = [
  'fruits',
  'vegetables',
  'animals',
  'clothing',
  'kitchen',
  'vehicles',
] as const;

export type CategoryId = (typeof SORTING_CATEGORIES)[number];

const CATEGORY_ITEMS: Record<CategoryId, { id: string; emoji: string }[]> = {
  fruits: [
    { id: 'apple', emoji: '🍎' },
    { id: 'banana', emoji: '🍌' },
    { id: 'grapes', emoji: '🍇' },
    { id: 'orange', emoji: '🍊' },
    { id: 'strawberry', emoji: '🍓' },
    { id: 'watermelon', emoji: '🍉' },
  ],
  vegetables: [
    { id: 'carrot', emoji: '🥕' },
    { id: 'potato', emoji: '🥔' },
    { id: 'tomato', emoji: '🍅' },
    { id: 'onion', emoji: '🧅' },
    { id: 'corn', emoji: '🌽' },
    { id: 'broccoli', emoji: '🥦' },
  ],
  animals: [
    { id: 'dog', emoji: '🐶' },
    { id: 'cat', emoji: '🐱' },
    { id: 'cow', emoji: '🐄' },
    { id: 'elephant', emoji: '🐘' },
    { id: 'rabbit', emoji: '🐰' },
    { id: 'horse', emoji: '🐴' },
  ],
  clothing: [
    { id: 'shirt', emoji: '👕' },
    { id: 'shoe', emoji: '👟' },
    { id: 'hat', emoji: '🎩' },
    { id: 'sock', emoji: '🧦' },
    { id: 'glove', emoji: '🧤' },
    { id: 'scarf', emoji: '🧣' },
  ],
  kitchen: [
    { id: 'cup', emoji: '☕' },
    { id: 'plate', emoji: '🍽️' },
    { id: 'spoon', emoji: '🥄' },
    { id: 'fork', emoji: '🍴' },
    { id: 'pot', emoji: '🍲' },
    { id: 'pan', emoji: '🍳' },
  ],
  vehicles: [
    { id: 'car', emoji: '🚗' },
    { id: 'bus', emoji: '🚌' },
    { id: 'bicycle', emoji: '🚲' },
    { id: 'boat', emoji: '⛵' },
    { id: 'train', emoji: '🚆' },
    { id: 'airplane', emoji: '✈️' },
  ],
};

export type SortableObject = {
  id: string;
  category: CategoryId;
  itemId: string;
  emoji: string;
};

export type SortingRound = {
  bins: CategoryId[];
  objects: SortableObject[];
};

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateRound(
  objectCount: number,
  binCount: number,
): SortingRound {
  const bins = SORTING_CATEGORIES.slice(
    0,
    Math.min(binCount, SORTING_CATEGORIES.length),
  );
  const pool: SortableObject[] = bins.flatMap(category =>
    CATEGORY_ITEMS[category].map(item => ({
      id: `${category}-${item.id}`,
      category,
      itemId: item.id,
      emoji: item.emoji,
    })),
  );
  const objects = shuffled(pool).slice(0, Math.min(objectCount, pool.length));
  return { bins, objects };
}
