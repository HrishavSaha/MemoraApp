import { storage } from '../storage/mmkv';

export type FlashcardsProgress = {
  cardCount: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
};

export type CardResult = 'correct' | 'wrong';

const KEY_PREFIX = '@memora/games/flashcards/';

export const MIN_CARDS = 4;
export const MAX_CARDS = 14;

const CORRECT_STREAK_FOR_GROWTH = 3;
const WRONG_STREAK_FOR_SHRINK = 2;
const CARDS_STEP = 2;

const DEFAULT_PROGRESS: FlashcardsProgress = {
  cardCount: MIN_CARDS,
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
};

export function readFlashcardsProgress(patientId: string): FlashcardsProgress {
  const raw = storage.getString(KEY_PREFIX + patientId);
  if (raw) {
    try {
      return JSON.parse(raw) as FlashcardsProgress;
    } catch {
      // Corrupt value — fall through and reseed.
    }
  }
  storage.set(KEY_PREFIX + patientId, JSON.stringify(DEFAULT_PROGRESS));
  return DEFAULT_PROGRESS;
}

export function writeFlashcardsProgress(
  patientId: string,
  progress: FlashcardsProgress,
) {
  storage.set(KEY_PREFIX + patientId, JSON.stringify(progress));
}

/**
 * Pure leveling rules. Unlike the other games, the streak here is tracked
 * per card (not per round/deck) — 3 correct recalls in a row grow the deck,
 * 2 misses in a row shrink it. A level change only takes effect on the next
 * deck, once the one in progress is finished.
 */
export function applyCardResult(
  progress: FlashcardsProgress,
  result: CardResult,
): FlashcardsProgress {
  if (result === 'correct') {
    const consecutiveCorrect = progress.consecutiveCorrect + 1;
    if (consecutiveCorrect < CORRECT_STREAK_FOR_GROWTH) {
      return { ...progress, consecutiveCorrect, consecutiveWrong: 0 };
    }
    return {
      cardCount: Math.min(MAX_CARDS, progress.cardCount + CARDS_STEP),
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
    };
  }

  const consecutiveWrong = progress.consecutiveWrong + 1;
  if (consecutiveWrong < WRONG_STREAK_FOR_SHRINK) {
    return { ...progress, consecutiveWrong, consecutiveCorrect: 0 };
  }
  return {
    cardCount: Math.max(MIN_CARDS, progress.cardCount - CARDS_STEP),
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
  };
}

export const FLASHCARD_WORDS = [
  { id: 'apple', emoji: '🍎' },
  { id: 'banana', emoji: '🍌' },
  { id: 'dog', emoji: '🐶' },
  { id: 'cat', emoji: '🐱' },
  { id: 'sun', emoji: '☀️' },
  { id: 'moon', emoji: '🌙' },
  { id: 'star', emoji: '⭐' },
  { id: 'tree', emoji: '🌳' },
  { id: 'flower', emoji: '🌸' },
  { id: 'fish', emoji: '🐟' },
  { id: 'bird', emoji: '🐦' },
  { id: 'book', emoji: '📖' },
  { id: 'chair', emoji: '🪑' },
  { id: 'umbrella', emoji: '☂️' },
] as const;

export type FlashcardWordId = (typeof FLASHCARD_WORDS)[number]['id'];

export type Flashcard = {
  id: FlashcardWordId;
  emoji: string;
};

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateDeck(cardCount: number): Flashcard[] {
  return shuffled(FLASHCARD_WORDS).slice(0, cardCount);
}
