import { storage } from '../storage/mmkv';

export type ReminderType = 'task' | 'medicine';

export type Reminder = {
  id: string;
  type: ReminderType;
  icon: string;
  name: string;
  time: string;
  description?: string;
  dosage?: string;
  done: boolean;
};

const KEY_PREFIX = '@memora/reminders/';

const DEFAULT_ICON: Record<ReminderType, string> = {
  task: '📝',
  medicine: '💊',
};

const SEED_REMINDERS: Record<string, Reminder[]> = {
  '1': [
    {
      id: 'seed-water',
      type: 'task',
      icon: '💧',
      name: 'Drink Water',
      time: '8:00 AM',
      done: true,
    },
    {
      id: 'seed-medicine-morning',
      type: 'medicine',
      icon: '💊',
      name: 'Morning Medicine',
      time: '9:00 AM',
      dosage: '1 tablet',
      done: true,
    },
    {
      id: 'seed-walk',
      type: 'task',
      icon: '🚶',
      name: 'Light Walk',
      time: '5:00 PM',
      done: false,
    },
    {
      id: 'seed-medicine-evening',
      type: 'medicine',
      icon: '💊',
      name: 'Evening Medicine',
      time: '8:00 PM',
      dosage: '1 tablet',
      done: false,
    },
  ],
  '2': [
    {
      id: 'seed-medicine-morning',
      type: 'medicine',
      icon: '💊',
      name: 'Morning Medicine',
      time: '9:00 AM',
      dosage: '1 tablet',
      done: false,
    },
  ],
  '3': [
    {
      id: 'seed-medicine-morning',
      type: 'medicine',
      icon: '💊',
      name: 'Morning Medicine',
      time: '9:00 AM',
      dosage: '1 tablet',
      done: false,
    },
  ],
};

export function defaultIconFor(type: ReminderType): string {
  return DEFAULT_ICON[type];
}

export function readReminders(patientId: string): Reminder[] {
  const raw = storage.getString(KEY_PREFIX + patientId);
  if (raw) {
    try {
      return JSON.parse(raw) as Reminder[];
    } catch {
      // Corrupt value — fall through and reseed.
    }
  }
  const seed = SEED_REMINDERS[patientId] ?? [];
  storage.set(KEY_PREFIX + patientId, JSON.stringify(seed));
  return seed;
}

export function writeReminders(patientId: string, reminders: Reminder[]) {
  storage.set(KEY_PREFIX + patientId, JSON.stringify(reminders));
}
