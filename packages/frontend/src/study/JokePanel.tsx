import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Coffee, Database, Laugh, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { JOKES, startIndex } from './jokes';

/**
 * Study-break panel. Shows a new joke whenever `tick` changes (the parent bumps it
 * when a skill moves forward) and on "Another one".
 */
export function JokePanel({
  seed,
  tick,
  movedToday,
  onHide,
}: {
  seed: string;
  tick: number;
  movedToday: number;
  onHide: () => void;
}) {
  const reduce = useReducedMotion();
  const [clicks, setClicks] = useState(0);
  const index = (startIndex(seed) + tick + clicks) % JOKES.length;
  const joke = JOKES[index];
  const Icon = joke.kind === 'data' ? Database : Coffee;

  return (
    <aside
      aria-label="Study break"
      className="relative overflow-hidden rounded-3xl border border-border bg-card/95 p-400 shadow-md backdrop-blur lg:rounded-4xl lg:p-500 lg:shadow-sm"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-status-studying via-status-reviewed to-status-confident"
      />
      <div className="flex items-center justify-between gap-300">
        <p className="flex items-center gap-200 font-heading text-400 font-semibold">
          <Laugh className="icon-size-300 text-status-reviewed" aria-hidden />
          Study break
        </p>
        <span className="flex items-center gap-100">
          <button
            type="button"
            onClick={() => setClicks((c) => c + 1)}
            className="inline-flex items-center gap-100 rounded-full border border-border px-300 py-100 text-200 font-semibold text-primary hover:border-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-ring lg:hidden"
          >
            <RefreshCw className="icon-size-100" aria-hidden /> Another one
          </button>
          <button
            type="button"
            onClick={onHide}
            aria-label="Hide study break"
            title="Hide study break"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="icon-size-200" aria-hidden />
          </button>
        </span>
      </div>

      <div className="mt-200 lg:mt-400 lg:min-h-36" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={index}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className={cn(
                'inline-flex items-center gap-100 rounded-full px-300 py-100 text-200 font-semibold',
                joke.kind === 'data' ? 'bg-accent text-accent-foreground' : 'bg-status-reviewed/15 text-status-reviewed',
              )}
            >
              <Icon className="icon-size-100" aria-hidden />
              {joke.kind === 'data' ? 'Data humor' : 'Office life'}
            </span>
            <blockquote className="mt-200 text-300 font-semibold leading-300 lg:mt-300 lg:text-400 lg:leading-500">{joke.text}</blockquote>
          </motion.figure>
        </AnimatePresence>
      </div>

      {/* On narrow screens "Another one" sits in the header to keep the pinned strip short. */}
      <div className="mt-400 hidden items-center justify-between gap-300 lg:flex">
        <p className="text-200 text-muted-foreground">
          {movedToday > 0 ? `${movedToday} moved forward today. Keep going!` : 'Move a skill forward for a fresh one.'}
        </p>
        <button
          type="button"
          onClick={() => setClicks((c) => c + 1)}
          className="inline-flex shrink-0 items-center gap-100 rounded-full border border-border px-300 py-100 text-300 font-semibold text-primary hover:border-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-ring"
        >
          <RefreshCw className="icon-size-200" aria-hidden /> Another one
        </button>
      </div>
    </aside>
  );
}
