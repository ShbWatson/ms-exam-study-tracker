import { RotateCcw, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { resetAllProgress } from '@/lib/study-data';

import { errorMessage } from './use-async';

/** "Start over" button with an "Are you sure?" confirmation that wipes all progress. */
export function StartOver({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const bodyId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setError(null);
    triggerRef.current?.focus();
  }, []);

  // Put focus on the safe choice when the dialog opens.
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  // Escape cancels (but not while a reset is running).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, close]);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await resetAllProgress();
      setOpen(false);
      onReset();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-100 rounded-full border border-border px-300 py-200 text-300 font-semibold text-muted-foreground hover:border-destructive hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring"
      >
        <RotateCcw className="icon-size-200" aria-hidden />
        Start over
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-background/70 p-500 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            className="w-full max-w-md rounded-4xl border border-border bg-card p-600 shadow-lg"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-destructive/15 text-destructive">
              <TriangleAlert className="icon-size-400" aria-hidden />
            </span>
            <h2 id={titleId} className="mt-400 font-heading text-600 font-bold leading-600">
              Are you sure?
            </h2>
            <p id={bodyId} className="mt-200 text-400 text-muted-foreground">
              This resets every skill in every exam back to <strong className="text-foreground">Not started</strong>.
              Your progress can&apos;t be recovered afterwards.
            </p>
            {error && (
              <p role="alert" className="mt-400 rounded-2xl bg-destructive/10 p-300 text-300 text-destructive">
                {error}
              </p>
            )}
            <div className="mt-600 flex flex-wrap justify-end gap-300">
              <button
                ref={cancelRef}
                type="button"
                onClick={close}
                disabled={busy}
                className="rounded-full border border-border px-500 py-200 text-300 font-semibold hover:bg-hover focus-visible:outline-2 focus-visible:outline-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={busy}
                className="rounded-full bg-destructive px-500 py-200 text-300 font-semibold text-destructive-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
              >
                {busy ? 'Resetting…' : 'Yes, reset everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
