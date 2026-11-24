import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: T };

export function errorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return 'Something went wrong while talking to Fabric.';
}

/** Runs `load` when `key` changes; exposes loading / error / ready plus a reload. */
export function useAsync<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const run = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      setState({ status: 'ready', data: await loadRef.current() });
    } catch (e) {
      setState({ status: 'error', error: errorMessage(e) });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch keyed to `key`
    void run();
  }, [run, key]);

  return [state, run] as const;
}
