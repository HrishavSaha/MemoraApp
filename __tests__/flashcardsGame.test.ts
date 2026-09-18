/**
 * @format
 */

import {
  applyCardResult,
  MAX_CARDS,
  MIN_CARDS,
  type FlashcardsProgress,
} from '../src/data/flashcardsGame';

const base: FlashcardsProgress = {
  cardCount: MIN_CARDS,
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
};

describe('applyCardResult', () => {
  test('a single correct card just tracks the streak', () => {
    const next = applyCardResult(base, 'correct');
    expect(next).toEqual({
      ...base,
      consecutiveCorrect: 1,
      consecutiveWrong: 0,
    });
  });

  test('2 correct in a row still just tracks the streak', () => {
    let progress = base;
    progress = applyCardResult(progress, 'correct');
    progress = applyCardResult(progress, 'correct');
    expect(progress).toEqual({
      ...base,
      consecutiveCorrect: 2,
      consecutiveWrong: 0,
    });
  });

  test('3 correct in a row grow the deck by 2 and reset the streak', () => {
    let progress = base;
    progress = applyCardResult(progress, 'correct');
    progress = applyCardResult(progress, 'correct');
    progress = applyCardResult(progress, 'correct');
    expect(progress).toEqual({
      cardCount: MIN_CARDS + 2,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
    });
  });

  test('the deck never grows past the maximum', () => {
    const nearMax: FlashcardsProgress = {
      cardCount: MAX_CARDS,
      consecutiveCorrect: 2,
      consecutiveWrong: 0,
    };
    const next = applyCardResult(nearMax, 'correct');
    expect(next.cardCount).toBe(MAX_CARDS);
  });

  test('a single wrong card just tracks the streak', () => {
    const next = applyCardResult(base, 'wrong');
    expect(next).toEqual({
      ...base,
      consecutiveCorrect: 0,
      consecutiveWrong: 1,
    });
  });

  test('2 wrong in a row shrink the deck by 2 and reset the streak', () => {
    const progress: FlashcardsProgress = {
      cardCount: MIN_CARDS + 4,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
    };
    let next = applyCardResult(progress, 'wrong');
    next = applyCardResult(next, 'wrong');
    expect(next).toEqual({
      cardCount: MIN_CARDS + 2,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
    });
  });

  test('the deck never shrinks past the minimum', () => {
    const atFloor: FlashcardsProgress = {
      cardCount: MIN_CARDS,
      consecutiveCorrect: 0,
      consecutiveWrong: 1,
    };
    const next = applyCardResult(atFloor, 'wrong');
    expect(next.cardCount).toBe(MIN_CARDS);
  });

  test('a correct card resets a wrong streak and vice versa', () => {
    const afterWrongs = applyCardResult(
      { ...base, consecutiveWrong: 1 },
      'correct',
    );
    expect(afterWrongs.consecutiveWrong).toBe(0);

    const afterCorrects = applyCardResult(
      { ...base, consecutiveCorrect: 2 },
      'wrong',
    );
    expect(afterCorrects.consecutiveCorrect).toBe(0);
  });
});
