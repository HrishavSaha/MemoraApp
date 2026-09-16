import { useCallback, useState } from 'react';
import { readCallNotes, writeCallNotes } from '../data/callNotes';

export function useCallNotes() {
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    readCallNotes(),
  );

  const setNote = useCallback((callId: string, note: string) => {
    setNotes(current => {
      const next = { ...current, [callId]: note };
      writeCallNotes(next);
      return next;
    });
  }, []);

  return { notes, setNote };
}
