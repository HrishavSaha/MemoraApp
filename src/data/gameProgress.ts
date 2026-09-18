export type GameDayLevel = {
  day: string;
  level: number;
};

export type GameWeeklyProgress = {
  gameName: string;
  days: GameDayLevel[];
};

export type GameWeekLevel = {
  week: string;
  level: number;
};

export type GameMonthlyProgress = {
  gameName: string;
  weeks: GameWeekLevel[];
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKS = ['W1', 'W2', 'W3', 'W4'];

function withDays(levels: number[]): GameDayLevel[] {
  return levels.map((level, index) => ({ day: DAYS[index], level }));
}

function withWeeks(levels: number[]): GameWeekLevel[] {
  return levels.map((level, index) => ({ week: WEEKS[index], level }));
}

const SEED_GAME_PROGRESS: Record<string, GameWeeklyProgress[]> = {
  '1': [
    { gameName: 'Memory Match', days: withDays([3, 3, 4, 4, 5, 5, 6]) },
    { gameName: 'Word Recall', days: withDays([2, 3, 3, 4, 4, 5, 5]) },
    { gameName: 'Pattern Puzzle', days: withDays([4, 4, 4, 5, 5, 6, 6]) },
    { gameName: 'Number Sequence', days: withDays([3, 4, 4, 4, 5, 5, 6]) },
  ],
  '2': [
    { gameName: 'Memory Match', days: withDays([5, 5, 4, 4, 4, 3, 3]) },
    { gameName: 'Word Recall', days: withDays([4, 4, 3, 4, 3, 3, 2]) },
    { gameName: 'Pattern Puzzle', days: withDays([5, 4, 4, 4, 3, 3, 3]) },
    { gameName: 'Number Sequence', days: withDays([4, 4, 3, 3, 3, 2, 2]) },
  ],
  '3': [
    { gameName: 'Memory Match', days: withDays([3, 2, 2, 1, 1, 1, 1]) },
    { gameName: 'Word Recall', days: withDays([2, 2, 1, 1, 1, 1, 1]) },
    { gameName: 'Pattern Puzzle', days: withDays([3, 3, 2, 2, 1, 1, 1]) },
    { gameName: 'Number Sequence', days: withDays([2, 2, 1, 1, 1, 1, 1]) },
  ],
};

const SEED_GAME_MONTHLY_PROGRESS: Record<string, GameMonthlyProgress[]> = {
  '1': [
    { gameName: 'Memory Match', weeks: withWeeks([3, 4, 5, 6]) },
    { gameName: 'Word Recall', weeks: withWeeks([2, 3, 4, 5]) },
    { gameName: 'Pattern Puzzle', weeks: withWeeks([4, 5, 5, 6]) },
    { gameName: 'Number Sequence', weeks: withWeeks([3, 4, 5, 6]) },
  ],
  '2': [
    { gameName: 'Memory Match', weeks: withWeeks([4, 5, 5, 4]) },
    { gameName: 'Word Recall', weeks: withWeeks([3, 4, 4, 3]) },
    { gameName: 'Pattern Puzzle', weeks: withWeeks([4, 5, 4, 4]) },
    { gameName: 'Number Sequence', weeks: withWeeks([3, 4, 4, 3]) },
  ],
  '3': [
    { gameName: 'Memory Match', weeks: withWeeks([4, 3, 2, 1]) },
    { gameName: 'Word Recall', weeks: withWeeks([3, 3, 2, 1]) },
    { gameName: 'Pattern Puzzle', weeks: withWeeks([4, 3, 3, 1]) },
    { gameName: 'Number Sequence', weeks: withWeeks([3, 3, 2, 1]) },
  ],
};

export function getWeeklyGameProgress(patientId: string): GameWeeklyProgress[] {
  return SEED_GAME_PROGRESS[patientId] ?? [];
}

/** Last 4 weeks of game levels, one point per week — used by the doctor dashboard. */
export function getMonthlyGameProgress(
  patientId: string,
): GameMonthlyProgress[] {
  return SEED_GAME_MONTHLY_PROGRESS[patientId] ?? [];
}
