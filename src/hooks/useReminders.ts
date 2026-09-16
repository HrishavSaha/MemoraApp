import { useCallback, useState } from 'react';
import {
  defaultIconFor,
  readReminders,
  writeReminders,
  type Reminder,
  type ReminderType,
} from '../data/reminders';

export type NewReminderInput = {
  type: ReminderType;
  name: string;
  time: string;
  description?: string;
  dosage?: string;
};

export function useReminders(patientId: string) {
  const [reminders, setReminders] = useState<Reminder[]>(() =>
    readReminders(patientId),
  );

  const persist = useCallback(
    (next: Reminder[]) => {
      setReminders(next);
      writeReminders(patientId, next);
    },
    [patientId],
  );

  const toggle = useCallback(
    (id: string) => {
      persist(
        reminders.map(reminder =>
          reminder.id === id ? { ...reminder, done: !reminder.done } : reminder,
        ),
      );
    },
    [reminders, persist],
  );

  const add = useCallback(
    (input: NewReminderInput) => {
      const reminder: Reminder = {
        id: `${Date.now()}`,
        icon: defaultIconFor(input.type),
        done: false,
        ...input,
      };
      persist([...reminders, reminder]);
    },
    [reminders, persist],
  );

  const update = useCallback(
    (id: string, input: NewReminderInput) => {
      persist(
        reminders.map(reminder =>
          reminder.id === id
            ? {
                ...reminder,
                ...input,
                icon:
                  reminder.type === input.type
                    ? reminder.icon
                    : defaultIconFor(input.type),
              }
            : reminder,
        ),
      );
    },
    [reminders, persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(reminders.filter(reminder => reminder.id !== id));
    },
    [reminders, persist],
  );

  return { reminders, toggle, add, update, remove };
}
