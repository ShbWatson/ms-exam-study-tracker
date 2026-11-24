import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { formatClock } from './clock';

/** Current time, re-rendered at the top of every minute. */
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const tick = () => setNow(new Date());
    // Wait for the next minute boundary, then tick once a minute.
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);
  return now;
}

/**
 * Decorative mascot: a wide-eyed owl mid study session, with a live clock.
 * Original artwork. Every text sits on a solid shape with strong contrast so it
 * reads the same in light and dark mode. Gentle motion is skipped when the
 * user prefers reduced motion.
 */
export function StudyOwl({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const now = useClock();
  const loop = (duration: number, delay = 0) =>
    reduce ? undefined : { duration, delay, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <svg viewBox="0 0 320 260" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="owl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b6dff" />
          <stop offset="1" stopColor="#5b3ff0" />
        </linearGradient>
      </defs>

      <ellipse cx="160" cy="238" rx="132" ry="13" fill="#14132b" opacity="0.16" />

      {/* Book stack */}
      <rect x="30" y="198" width="118" height="24" rx="6" fill="#ff6b5b" />
      <rect x="46" y="206" width="72" height="5" rx="2.5" fill="#ffffff" opacity="0.75" />
      <rect x="38" y="176" width="102" height="22" rx="6" fill="#ffe45c" />
      <rect x="50" y="184" width="62" height="5" rx="2.5" fill="#14132b" opacity="0.55" />
      <rect x="34" y="156" width="110" height="20" rx="6" fill="#2a2260" />
      <rect x="48" y="163" width="52" height="5" rx="2.5" fill="#dcd3ff" opacity="0.8" />

      {/* Owl (bobs gently) */}
      <motion.g animate={reduce ? undefined : { y: [0, -3, 0] }} transition={loop(3.2)}>
        <path d="M50 80 L58 46 L80 70 Z M142 80 L134 46 L112 70 Z" fill="#5b3ff0" />
        <ellipse cx="96" cy="116" rx="52" ry="54" fill="url(#owl-body)" />
        <ellipse cx="96" cy="130" rx="30" ry="31" fill="#dcd3ff" />
        <path
          d="M80 124q8 6 16 0q8 6 16 0M80 138q8 6 16 0q8 6 16 0"
          stroke="#7c5cff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Very awake eyes, with an occasional blink */}
        <circle cx="76" cy="94" r="20" fill="#ffffff" />
        <circle cx="116" cy="94" r="20" fill="#ffffff" />
        <motion.g
          style={{ transformOrigin: '96px 96px' }}
          animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1] }}
          transition={reduce ? undefined : { duration: 4.5, times: [0, 0.9, 0.95, 1], repeat: Infinity }}
        >
          <circle cx="79" cy="96" r="9" fill="#14132b" />
          <circle cx="113" cy="96" r="9" fill="#14132b" />
          <circle cx="82" cy="92" r="3" fill="#ffffff" />
          <circle cx="116" cy="92" r="3" fill="#ffffff" />
        </motion.g>
        <path d="M90 106 L96 116 L102 106 Z" fill="#ffb020" />
        {/* Wing reaching for the mug */}
        <path d="M144 118 q26 4 32 24" stroke="#5b3ff0" strokeWidth="14" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Mug: white text on deep violet for strong contrast */}
      <rect x="160" y="134" width="44" height="40" rx="8" fill="#3b2a99" />
      <path d="M204 143 q15 3 0 22" stroke="#3b2a99" strokeWidth="6" fill="none" strokeLinecap="round" />
      <text
        x="182"
        y="159"
        textAnchor="middle"
        fontFamily="Fredoka, 'Segoe UI', sans-serif"
        fontSize="12"
        fontWeight="700"
        fill="#ffffff"
        letterSpacing="0.5"
      >
        FOCUS
      </text>
      {/* Steam */}
      {[170, 182, 194].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 128 q-6 -10 2 -18 q6 -8 0 -16`}
          stroke="#a9a6cc"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ opacity: 0.6 }}
          animate={reduce ? undefined : { opacity: [0, 0.8, 0], y: [4, -6, -12] }}
          transition={loop(2.4, i * 0.5)}
        />
      ))}

      {/* Laptop with a rising chart */}
      <rect x="214" y="150" width="88" height="58" rx="8" fill="#1f2045" stroke="#8b6dff" strokeWidth="3" />
      <rect x="204" y="206" width="108" height="10" rx="5" fill="#3a3b6b" />
      <rect x="228" y="186" width="10" height="14" rx="2" fill="#ffe45c" />
      <rect x="244" y="176" width="10" height="24" rx="2" fill="#ff6b5b" />
      <rect x="260" y="166" width="10" height="34" rx="2" fill="#8b6dff" />
      <rect x="276" y="160" width="10" height="40" rx="2" fill="#b3a1ff" />

      {/* Clock badge: lemon text on a dark pill reads in both themes */}
      <rect x="137" y="30" width="116" height="32" rx="16" fill="#14132b" />
      <text
        x="195"
        y="52"
        textAnchor="middle"
        fontFamily="Fredoka, 'Segoe UI', sans-serif"
        fontSize="17"
        fontWeight="700"
        fill="#ffe45c"
      >
        {formatClock(now)}
      </text>
      <motion.path
        d="M282 58 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z"
        fill="#ffb020"
        style={{ transformOrigin: '282px 72px' }}
        animate={reduce ? undefined : { scale: [1, 1.25, 1], rotate: [0, 20, 0] }}
        transition={loop(2.8)}
      />
    </svg>
  );
}
