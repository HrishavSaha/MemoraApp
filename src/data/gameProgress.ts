export type GameDayLevel = {
  day: string;
  level: number;
};

export type GameWeeklyProgress = {
  gameName: string;
  days: GameDayLevel[];
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function withDays(levels: number[]): GameDayLevel[] {
  return levels.map((level, index) => ({ day: DAYS[index], level }));
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

export function getWeeklyGameProgress(patientId: string): GameWeeklyProgress[] {
  return SEED_GAME_PROGRESS[patientId] ?? [];
}
