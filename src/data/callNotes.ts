import { storage } from '../storage/mmkv';

const KEY = '@memora/callNotes';

export function readCallNotes(): Record<string, string> {
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

export function writeCallNotes(notes: Record<string, string>) {
  storage.set(KEY, JSON.stringify(notes));
}
