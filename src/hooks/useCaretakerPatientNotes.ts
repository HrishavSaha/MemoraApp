import { useCallback, useState } from 'react';
import {
  readCaretakerPatientNotes,
  writeCaretakerPatientNotes,
} from '../data/caretakerPatientNotes';

export function useCaretakerPatientNotes() {
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    readCaretakerPatientNotes(),
  );

  const setNote = useCallback((patientId: string, note: string) => {
    setNotes(current => {
      const next = { ...current, [patientId]: note };
      writeCaretakerPatientNotes(next);
      return next;
    });
  }, []);

  return { notes, setNote };
}
