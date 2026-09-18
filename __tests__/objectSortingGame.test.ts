/**
 * @format
 */

import {
  applyRoundResult,
  generateRound,
  MAX_OBJECTS,
  MIN_BINS,
  MIN_OBJECTS,
  SORTING_CATEGORIES,
  type ObjectSortingProgress,
} from '../src/data/objectSortingGame';

const base: ObjectSortingProgress = {
  objectCount: 3,
  binCount: 2,
  consecutiveWins: 0,
  consecutiveLosses: 0,
};

describe('applyRoundResult', () => {
  test('a single win just tracks the streak', () => {
    const next = applyRoundResult(base, 'win');
    expect(next).toEqual({ ...base, consecutiveWins: 1, consecutiveLosses: 0 });
  });

  test('3 consecutive wins add 2 objects', () => {
    let progress = base;
    progress = applyRoundResult(progress, 'win');
    progress = applyRoundResult(progress, 'win');
    progress = applyRoundResult(progress, 'win');
    expect(progress).toEqual({
      objectCount: 5,
      binCount: 2,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    });
  });

  test('hitting the object cap wraps back down and grows the bins', () => {
    const nearCap: ObjectSortingProgress = {
      objectCount: MAX_OBJECTS - 2,
      binCount: 2,
      consecutiveWins: 2,
      consecutiveLosses: 0,
    };
    const next = applyRoundResult(nearCap, 'win');
    expect(next).toEqual({
      objectCount: MIN_OBJECTS,
      binCount: 3,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    });
  });

  test('a single loss just tracks the streak and repeats the level', () => {
    const next = applyRoundResult(base, 'loss');
    expect(next).toEqual({ ...base, consecutiveWins: 0, consecutiveLosses: 1 });
  });

  test('3 consecutive losses remove 1 object', () => {
    const progress: ObjectSortingProgress = {
      objectCount: 5,
      binCount: 2,
      consecutiveWins: 0,
      consecutiveLosses: 2,
    };
    const next = applyRoundResult(progress, 'loss');
    expect(next).toEqual({
      objectCount: 4,
      binCount: 2,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    });
  });

  test('losing down to bins + 2 objects also shrinks the bins', () => {
    const progress: ObjectSortingProgress = {
      objectCount: 5,
      binCount: 2,
      consecutiveWins: 0,
      consecutiveLosses: 2,
    };
    // 5 -> 4, which equals binCount(2) + 2, so bins should drop too — but
    // bins are already at MIN_BINS, so they stay put.
    const next = applyRoundResult(progress, 'loss');
    expect(next.objectCount).toBe(4);
    expect(next.binCount).toBe(MIN_BINS);
  });

  test('losing down to bins + 2 shrinks the bins when above the floor', () => {
    const progress: ObjectSortingProgress = {
      objectCount: 5,
      binCount: 3,
      consecutiveWins: 0,
      consecutiveLosses: 2,
    };
    // 5 -> 4, which equals binCount(3) + 1, not +2, so no bin change here.
    const next = applyRoundResult(progress, 'loss');
    expect(next.binCount).toBe(3);

    const atTrigger: ObjectSortingProgress = {
      objectCount: 6,
      binCount: 3,
      consecutiveWins: 0,
      consecutiveLosses: 2,
    };
    // 6 -> 5, which equals binCount(3) + 2, so bins drop to 2.
    const wrapped = applyRoundResult(atTrigger, 'loss');
    expect(wrapped).toEqual({
      objectCount: 5,
      binCount: 2,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    });
  });

  test('object count never drops below the minimum', () => {
    const atFloor: ObjectSortingProgress = {
      objectCount: MIN_OBJECTS,
      binCount: 2,
      consecutiveWins: 0,
      consecutiveLosses: 2,
    };
    const next = applyRoundResult(atFloor, 'loss');
    expect(next.objectCount).toBe(MIN_OBJECTS);
  });

  test('a win resets any loss streak and vice versa', () => {
    const afterLosses = applyRoundResult(
      { ...base, consecutiveLosses: 2 },
      'win',
    );
    expect(afterLosses.consecutiveLosses).toBe(0);

    const afterWins = applyRoundResult({ ...base, consecutiveWins: 2 }, 'loss');
    expect(afterWins.consecutiveWins).toBe(0);
  });
});

describe('generateRound', () => {
  test('produces the requested number of bins and objects', () => {
    const round = generateRound(5, 3);
    expect(round.bins).toEqual(SORTING_CATEGORIES.slice(0, 3));
    expect(round.objects).toHaveLength(5);
  });

  test("every object belongs to one of the round's bins", () => {
    const round = generateRound(7, 4);
    round.objects.forEach(object => {
      expect(round.bins).toContain(object.category);
    });
  });

  test('never produces duplicate objects within a round', () => {
    const round = generateRound(MAX_OBJECTS, 6);
    const ids = round.objects.map(object => object.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('clamps the bin count to the number of available categories', () => {
    const round = generateRound(3, SORTING_CATEGORIES.length + 5);
    expect(round.bins).toEqual(SORTING_CATEGORIES);
  });
});
