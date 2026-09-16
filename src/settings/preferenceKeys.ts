import { storage } from '../storage/mmkv';

export const MUSIC_KEY = '@memora/settings/music';
export const AUDIO_SUPPORT_KEY = '@memora/settings/audioSupport';
export const HAPTICS_KEY = '@memora/settings/haptics';

export function readToggle(key: string, fallback: boolean) {
  const stored = storage.getBoolean(key);
  return stored === undefined ? fallback : stored;
}

export function isHapticsEnabled() {
  return readToggle(HAPTICS_KEY, true);
}
