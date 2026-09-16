export type DayAdherence = {
  day: string;
  percentage: number;
};

const SEED_ADHERENCE: Record<string, DayAdherence[]> = {
  '1': [
    { day: 'Mon', percentage: 100 },
    { day: 'Tue', percentage: 100 },
    { day: 'Wed', percentage: 75 },
    { day: 'Thu', percentage: 100 },
    { day: 'Fri', percentage: 100 },
    { day: 'Sat', percentage: 100 },
    { day: 'Sun', percentage: 100 },
  ],
  '2': [
    { day: 'Mon', percentage: 75 },
    { day: 'Tue', percentage: 50 },
    { day: 'Wed', percentage: 75 },
    { day: 'Thu', percentage: 100 },
    { day: 'Fri', percentage: 50 },
    { day: 'Sat', percentage: 75 },
    { day: 'Sun', percentage: 75 },
  ],
  '3': [
    { day: 'Mon', percentage: 50 },
    { day: 'Tue', percentage: 25 },
    { day: 'Wed', percentage: 50 },
    { day: 'Thu', percentage: 0 },
    { day: 'Fri', percentage: 25 },
    { day: 'Sat', percentage: 50 },
    { day: 'Sun', percentage: 25 },
  ],
};

export function getWeeklyAdherence(patientId: string): DayAdherence[] {
  return SEED_ADHERENCE[patientId] ?? [];
}

export function getAverageAdherence(patientId: string): number {
  const days = getWeeklyAdherence(patientId);
  if (days.length === 0) {
    return 0;
  }
  const sum = days.reduce((total, day) => total + day.percentage, 0);
  return Math.round(sum / days.length);
}
