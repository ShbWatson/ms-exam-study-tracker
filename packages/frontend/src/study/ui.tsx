import { animate, useReducedMotion } from 'framer-motion';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Animates a whole number from its previous value to `value`. */
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  const from = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <>
      {reduce ? value : shown}
      {suffix}
    </>
  );
}

/** Circular progress gauge with a gradient stroke; value is 0..1. */
export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  label,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  className?: string;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const pctValue = Math.round(v * 100);
  return (
    <div
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pctValue}% ready`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="[stop-color:var(--color-status-studying)]" />
            <stop offset="55%" className="[stop-color:var(--color-status-reviewed)]" />
            <stop offset="100%" className="[stop-color:var(--color-status-confident)]" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          stroke={v > 0 ? `url(#ring-${id})` : 'none'}
          className={cn(!reduce && 'transition-[stroke-dashoffset] duration-700 ease-out')}
        />
      </svg>
      <span className="absolute font-numeric text-300 font-semibold">
        {label === undefined ? <CountUp value={pctValue} suffix="%" /> : label}
      </span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-muted', className)} />;
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-300 rounded-2xl border border-destructive/40 bg-card p-500">
      <AlertTriangle className="icon-size-400 shrink-0 text-destructive" aria-hidden />
      <div className="flex-1">
        <p className="text-400 font-semibold">Couldn't load this from Fabric</p>
        <p className="mt-100 text-300 text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-200 rounded-full border border-border px-400 py-200 text-300 font-medium hover:bg-hover focus-visible:outline-2 focus-visible:outline-ring"
        >
          <RotateCw className="icon-size-200" aria-hidden /> Retry
        </button>
      )}
    </div>
  );
}
