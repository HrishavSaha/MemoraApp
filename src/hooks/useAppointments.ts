import { useCallback, useState } from 'react';
import {
  readAppointments,
  writeAppointments,
  type Appointment,
} from '../data/appointments';

export type AppointmentInput = Omit<Appointment, 'id'>;

export function useAppointments(patientId: string) {
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    readAppointments(patientId),
  );

  const persist = useCallback(
    (next: Appointment[]) => {
      setAppointments(next);
      writeAppointments(patientId, next);
    },
    [patientId],
  );

  const add = useCallback(
    (input: AppointmentInput) => {
      persist([...appointments, { id: `${Date.now()}`, ...input }]);
    },
    [appointments, persist],
  );

  const update = useCallback(
    (id: string, input: AppointmentInput) => {
      persist(
        appointments.map(appointment =>
          appointment.id === id ? { id, ...input } : appointment,
        ),
      );
    },
    [appointments, persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(appointments.filter(appointment => appointment.id !== id));
    },
    [appointments, persist],
  );

  return { appointments, add, update, remove };
}
