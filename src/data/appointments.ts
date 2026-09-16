import { storage } from '../storage/mmkv';

export type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
};

const KEY_PREFIX = '@memora/appointments/';

const SEED_APPOINTMENTS: Record<string, Appointment[]> = {
  '1': [
    {
      id: 'seed-1',
      doctorName: 'Dr. Anjali Sharma',
      specialty: 'Neurologist',
      date: 'Mon, 22 Sep',
      time: '10:30 AM',
    },
    {
      id: 'seed-2',
      doctorName: 'Dr. Bikash Bora',
      specialty: 'General Physician',
      date: 'Fri, 26 Sep',
      time: '4:00 PM',
    },
  ],
  '2': [],
  '3': [],
};

export function readAppointments(patientId: string): Appointment[] {
  const raw = storage.getString(KEY_PREFIX + patientId);
  if (raw) {
    try {
      return JSON.parse(raw) as Appointment[];
    } catch {
      // Corrupt value — fall through and reseed.
    }
  }
  const seed = SEED_APPOINTMENTS[patientId] ?? [];
  storage.set(KEY_PREFIX + patientId, JSON.stringify(seed));
  return seed;
}

export function writeAppointments(
  patientId: string,
  appointments: Appointment[],
) {
  storage.set(KEY_PREFIX + patientId, JSON.stringify(appointments));
}
