import { useCallback, useEffect, useRef, useState } from 'react';

export type CelebrationKind = 'milestone' | 'subcategory' | 'domain' | 'exam';

export interface Celebration {
  id: number;
  kind: CelebrationKind;
  title: string;
  detail: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  size: number;
  delay: number;
  color: string;
}

const COLORS = ['bg-status-studying', 'bg-status-reviewed', 'bg-status-confident', 'bg-primary', 'bg-accent'];

// Bigger achievements get more confetti.
const BURST: Record<CelebrationKind, number> = { milestone: 28, subcategory: 36, domain: 60, exam: 90 };

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 900,
    y: 200 + Math.random() * 420,
    rotate: (Math.random() - 0.5) * 720,
    size: 6 + Math.random() * 8,
    delay: Math.random() * 0.15,
    color: COLORS[i % COLORS.length],
  }));
}

/** Queue of celebrations: one toast at a time, confetti per toast. */
export function useCelebrations() {
  const [current, setCurrent] = useState<Celebration | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const queue = useRef<Celebration[]>([]);
  const showing = useRef<Celebration | null>(null);
  const nextId = useRef(1);

  const show = useCallback((c: Celebration | null) => {
    showing.current = c;
    setCurrent(c);
    setParticles(c ? makeParticles(BURST[c.kind]) : []);
  }, []);

  const showNext = useCallback(() => show(queue.current.shift() ?? null), [show]);

  const celebrate = useCallback(
    (items: Omit<Celebration, 'id'>[]) => {
      if (!items.length) return;
      queue.current.push(...items.map((c) => ({ ...c, id: nextId.current++ })));
      if (!showing.current) showNext();
    },
    [showNext],
  );

  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(showNext, current.kind === 'exam' ? 6000 : 3800);
    return () => window.clearTimeout(t);
  }, [current, showNext]);

  return { current, particles, celebrate, dismiss: showNext };
}
