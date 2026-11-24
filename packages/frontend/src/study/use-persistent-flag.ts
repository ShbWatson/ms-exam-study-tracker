import { useCallback, useState } from 'react';

/** A per-browser on/off preference. Storage can be unavailable (private mode,
 *  embedded frames), so every read and write is guarded and falls back to memory. */
export function usePersistentFlag(key: string, initial = false) {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const v = window.localStorage.getItem(key);
      return v == null ? initial : v === '1';
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next: boolean) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, next ? '1' : '0');
      } catch {
        /* keep the in-memory value */
      }
    },
    [key],
  );

  return [value, set] as const;
}
