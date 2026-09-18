import { storage } from '../storage/mmkv';

const KEY = '@memora/doctorNotes';

// One note per patient, written by the doctor and read by the caretaker —
// the reverse direction of the caretaker's own note (see
// src/data/caretakerPatientNotes.ts). Seeded with a starting example per
// patient so the demo isn't empty; editable from the doctor's screen from
// there on, same "last write wins" shape as src/data/callNotes.ts.
const SEED_DOCTOR_NOTES: Record<string, string> = {
  '1': 'MoCA score improved since the last visit. The daily recall games seem to be helping — please keep up the current routine and continue monitoring sleep quality.',
  '2': "Medication adherence has been inconsistent this week. Please make sure the morning dose is taken with breakfast. No other changes needed for now — we'll reassess at the next visit.",
  '3': "MoCA scores and app engagement have both declined this month. Please schedule a check-in call and encourage short daily walks. I'd like to reassess sooner than the next scheduled appointment.",
};

export function readDoctorNotes(): Record<string, string> {
  const raw = storage.getString(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      // Corrupt value — fall through and reseed.
    }
  }
  storage.set(KEY, JSON.stringify(SEED_DOCTOR_NOTES));
  return SEED_DOCTOR_NOTES;
}

export function writeDoctorNotes(notes: Record<string, string>) {
  storage.set(KEY, JSON.stringify(notes));
}
