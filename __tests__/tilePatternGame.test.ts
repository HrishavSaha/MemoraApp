/**
 * @format
 */

import {
  applyRoundResult,
  MAX_PATTERN_LENGTH,
  MIN_GRID_SIZE,
  MIN_PATTERN_LENGTH,
  type TilePatternProgress,
} from '../src/data/tilePatternGame';

const base: TilePatternProgress = {
  gridSize: 2,
  patternLength: 3,
  consecutiveWins: 0,
  consecutiveLosses: 0,
};

describe('applyRoundResult', () => {
  test('a slow win below the streak threshold just tracks the streak', () => {
    const next = applyRoundResult(base, 'win', 25);
    expect(next).toEqual({
      ...base,
      consecutiveWins: 1,
      consecutiveLosses: 0,
    });
  });

  test('a win under 20s levels up immediately', () => {
    const next = applyRoundResult(base, 'win', 12);
    expect(next.patternLength).toBe(base.patternLength + 1);
    expect(next.consecutiveWins).toBe(0);
  });

  test('3 consecutive slow wins level up even without a fast win', () => {
    let progress = base;
    progress = applyRoundResult(progress, 'win', 25);
    progress = applyRoundResult(progress, 'win', 25);
    progress = applyRoundResult(progress, 'win', 25);
    expect(progress.patternLength).toBe(base.patternLength + 1);
    expect(progress.consecutiveWins).toBe(0);
  });

  test('leveling up past the max pattern length resets it and grows the grid', () => {
    const atMax: TilePatternProgress = {
      gridSize: 2,
      patternLength: MAX_PATTERN_LENGTH,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    };
    const next = applyRoundResult(atMax, 'win', 5);
    expect(next).toEqual({
      gridSize: 3,
      patternLength: MIN_PATTERN_LENGTH,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    });
  });

  test('a single loss just tracks the streak and repeats the level', () => {
    const next = applyRoundResult(base, 'loss', 10);
    expect(next).toEqual({
      ...base,
      consecutiveWins: 0,
      consecutiveLosses: 1,
    });
  });

  test('3 consecutive losses reduce the pattern length', () => {
    let progress: TilePatternProgress = { ...base, patternLength: 5 };
    progress = applyRoundResult(progress, 'loss', 10);
    progress = applyRoundResult(progress, 'loss', 10);
    progress = applyRoundResult(progress, 'loss', 10);
    expect(progress.patternLength).toBe(4);
    expect(progress.consecutiveLosses).toBe(0);
  });

  test('losing at the minimum pattern length shrinks the grid instead', () => {
    let progress = base;
    progress = applyRoundResult(progress, 'loss', 10);
    progress = applyRoundResult(progress, 'loss', 10);
    progress = applyRoundResult(progress, 'loss', 10);
    expect(progress).toEqual({
      gridSize: MIN_GRID_SIZE,
      patternLength: MIN_PATTERN_LENGTH,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    });
  });

  test('grid size never drops below the minimum', () => {
    const atFloor: TilePatternProgress = {
      gridSize: MIN_GRID_SIZE,
      patternLength: MIN_PATTERN_LENGTH,
      consecutiveWins: 0,
      consecutiveLosses: 2,
    };
    const next = applyRoundResult(atFloor, 'loss', 10);
    expect(next.gridSize).toBe(MIN_GRID_SIZE);
  });

  test('a win resets any loss streak and vice versa', () => {
    const afterLosses = applyRoundResult(
      { ...base, consecutiveLosses: 2 },
      'win',
      25,
    );
    expect(afterLosses.consecutiveLosses).toBe(0);

    const afterWins = applyRoundResult(
      { ...base, consecutiveWins: 2 },
      'loss',
      10,
    );
    expect(afterWins.consecutiveWins).toBe(0);
  });
});
