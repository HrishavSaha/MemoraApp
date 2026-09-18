import { useCallback, useState } from 'react';
import { readDoctorNotes, writeDoctorNotes } from '../data/doctorNotes';

export function useDoctorNotes() {
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    readDoctorNotes(),
  );

  const setNote = useCallback((patientId: string, note: string) => {
    setNotes(current => {
      const next = { ...current, [patientId]: note };
      writeDoctorNotes(next);
      return next;
    });
  }, []);

  return { notes, setNote };
}
