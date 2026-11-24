import { motion, useReducedMotion } from 'framer-motion';
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CirclePlay,
  Code2,
  Database,
  ExternalLink,
  Lock,
  Newspaper,
  NotebookPen,
  TriangleAlert,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import { ABOUT, type AboutLinkKind, type StoryPart } from './about-content';

const LINK_ICON: Record<AboutLinkKind, LucideIcon> = {
  profile: UserRound,
  blog: Newspaper,
  video: CirclePlay,
  code: Code2,
};

const inlineLink =
  'font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-ring';

function Paragraph({ parts }: { parts: readonly StoryPart[] }) {
  return (
    <p>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          part
        ) : (
          <a key={i} href={part.href} target="_blank" rel="noreferrer" className={inlineLink}>
            {part.text}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ),
      )}
    </p>
  );
}

const FLOW: { icon: LucideIcon; title: string; detail: string }[] = [
  { icon: BookOpen, title: 'Microsoft Learn', detail: 'Official exam study guides' },
  { icon: NotebookPen, title: 'Fabric notebook', detail: 'Refreshes the skills when you run it, or daily on a schedule' },
  { icon: Database, title: 'Lakehouse', detail: 'Stores exams, domains and skills' },
  { icon: AppWindow, title: 'This app', detail: 'Built with Fabric Apps' },
];

export function AboutPage({ onBack }: { onBack: () => void }) {
  const reduce = useReducedMotion();
  const links = ABOUT.links.filter((l) => l.href);
  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as const } };

  return (
    <section aria-labelledby="about-title" className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-200 rounded-full px-300 py-100 text-300 font-medium text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="icon-size-200" aria-hidden /> All exams
      </button>

      {/* Who made this */}
      <motion.div
        {...rise(0)}
        className="mt-600 flex flex-col gap-600 rounded-4xl border border-border bg-card/90 p-600 shadow-sm backdrop-blur sm:flex-row sm:items-start sm:p-800"
      >
        {ABOUT.photo ? (
          <img
            src={ABOUT.photo}
            alt={`Photo of ${ABOUT.name}`}
            className="size-32 shrink-0 rounded-full object-cover ring-4 ring-primary/30"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-32 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-status-reviewed font-heading text-hero-700 font-bold text-primary-foreground ring-4 ring-primary/20"
          >
            {ABOUT.initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-300 font-semibold text-primary">About this app</p>
          <h1 id="about-title" className="mt-100 font-heading text-hero-700 font-bold leading-hero-700">
            Hi, I'm {ABOUT.name.split(' ')[0]}
          </h1>
          <p className="mt-100 text-300 text-muted-foreground">{ABOUT.tagline}</p>
          <div className="mt-500 space-y-300 text-400">
            {ABOUT.story.map((parts, i) => (
              <Paragraph key={i} parts={parts} />
            ))}
          </div>
          {links.length > 0 && (
            <ul className="mt-600 flex flex-wrap gap-300" aria-label={`Find ${ABOUT.name.split(' ')[0]} online`}>
              {links.map((l) => {
                const Icon = LINK_ICON[l.kind];
                return (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-200 rounded-full border border-border bg-card px-400 py-200 text-300 font-semibold transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <Icon className="icon-size-200" aria-hidden />
                      {l.label}
                      <ExternalLink className="icon-size-200 opacity-60" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>

      {/* Official-source reminder */}
      <motion.aside
        {...rise(0.03)}
        aria-label="Important"
        className="mt-500 flex items-start gap-300 rounded-3xl border-2 border-status-studying bg-status-studying/15 p-500"
      >
        <TriangleAlert className="mt-0.5 icon-size-300 shrink-0 text-foreground" aria-hidden />
        <p className="text-300">
          <strong className="font-semibold">{ABOUT.notice.title}</strong> {ABOUT.notice.text}
        </p>
      </motion.aside>

      {/* How I passed */}
      {ABOUT.examStories.length > 0 && (
        <motion.div {...rise(0.05)} className="mt-800">
          <h2 className="font-heading text-500 font-semibold">How I passed</h2>
          <p className="mt-100 text-300 text-muted-foreground">What worked for me, in case it helps you plan.</p>
          <ul className="mt-500 grid gap-400 sm:grid-cols-2">
            {ABOUT.examStories.map((post) => (
              <li key={post.href}>
                <a
                  href={post.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full items-start gap-400 rounded-3xl border border-border bg-card p-500 shadow-sm transition hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
                    <Trophy className="icon-size-300" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-monospace text-200 text-primary">{post.exam} · Blog post</span>
                    <span className="mt-100 block text-300 font-semibold group-hover:text-primary">{post.title}</span>
                  </span>
                  <ExternalLink className="ml-auto icon-size-200 shrink-0 opacity-60" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* How it works */}
      <motion.div {...rise(0.1)} className="mt-800">
        <h2 className="font-heading text-500 font-semibold">Built with Microsoft Fabric</h2>
        <p className="mt-100 text-300 text-muted-foreground">How the skills get from Microsoft Learn to your screen.</p>
        <ol className="mt-500 flex flex-col gap-200 md:flex-row md:gap-800">
          {FLOW.map((step, i) => (
            <li key={step.title} className="flex flex-col items-center gap-200 md:relative md:flex-1">
              <div className="flex w-full items-center gap-300 rounded-3xl border border-border bg-card p-400 shadow-sm md:h-full md:flex-col md:text-center">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <step.icon className="icon-size-300" aria-hidden />
                </span>
                <span>
                  <span className="block text-300 font-semibold">{step.title}</span>
                  <span className="block text-200 text-muted-foreground">{step.detail}</span>
                </span>
              </div>
              {i < FLOW.length - 1 && (
                <ArrowRight
                  className="icon-size-300 shrink-0 rotate-90 text-primary md:absolute md:top-1/2 md:-right-[26px] md:-translate-y-1/2 md:rotate-0"
                  aria-hidden
                />
              )}
            </li>
          ))}
        </ol>
        <p className="mt-400 flex items-start gap-200 rounded-3xl bg-secondary/70 p-400 text-300">
          <Lock className="mt-0.5 icon-size-200 shrink-0 text-primary" aria-hidden />
          <span>
            You sign in with your Fabric account, and your progress is saved in the app's own Fabric database. Each
            person only sees their own progress.
          </span>
        </p>
      </motion.div>
    </section>
  );
}
