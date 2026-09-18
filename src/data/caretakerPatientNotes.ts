import { storage } from '../storage/mmkv';

const KEY = '@memora/caretakerPatientNotes';

// One general note per patient, written by the caretaker and read by the
// doctor — separate from the per-call notes in src/data/callNotes.ts, which
// stay tied to individual call log entries.
export function readCaretakerPatientNotes(): Record<string, string> {
  const raw = storage.getString(KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function writeCaretakerPatientNotes(notes: Record<string, string>) {
  storage.set(KEY, JSON.stringify(notes));
}
