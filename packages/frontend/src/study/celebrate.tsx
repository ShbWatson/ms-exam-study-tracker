import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PartyPopper, Sparkles, Trophy } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { Celebration, CelebrationKind, Particle } from './use-celebrations';

const ICON: Record<CelebrationKind, typeof Trophy> = {
  milestone: Sparkles,
  subcategory: PartyPopper,
  domain: Trophy,
  exam: Trophy,
};

export function CelebrationLayer({
  current,
  particles,
  onDismiss,
}: {
  current: Celebration | null;
  particles: Particle[];
  onDismiss: () => void;
}) {
  const reduce = useReducedMotion();
  const Icon = current ? ICON[current.kind] : Sparkles;

  return (
    <>
      {/* Confetti: decorative, never intercepts clicks, skipped when motion is reduced. */}
      {!reduce && current && (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center">
          {particles.map((p) => (
            <motion.span
              key={`${current.id}-${p.id}`}
              className={cn('absolute top-24 rounded-sm', p.color)}
              style={{ width: p.size, height: p.size * 0.45 }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
              animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 1 }}
              transition={{ duration: 1.8, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-600 z-50 flex justify-center px-400">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              role="status"
              aria-live="polite"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="pointer-events-auto flex max-w-md items-center gap-400 rounded-4xl border border-primary/30 bg-card px-500 py-400 shadow-lg"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Icon className="icon-size-400" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-heading text-400 font-bold">{current.title}</span>
                <span className="block text-300 text-muted-foreground">{current.detail}</span>
              </span>
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-full px-300 py-100 text-300 font-medium text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-ring"
              >
                Nice!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/** Thin 0–100% bar for the bottom of a card. */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(1, value));
  const done = v >= 1;
  return (
    <div className="mt-400">
      <div className="mb-100 flex justify-between text-200 text-muted-foreground">
        <span>{label}</span>
        <span className={cn('font-numeric', done && 'font-semibold text-primary')}>
          {Math.round(v * 100)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v * 100)}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          className={cn('h-full rounded-full', done ? 'bg-status-confident' : 'bg-primary')}
          initial={false}
          animate={{ width: `${v * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
