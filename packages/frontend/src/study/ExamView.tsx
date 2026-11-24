import type { SkillStatus } from '@rayfin-app/shared';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, ExternalLink, Flame, Laugh, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  listProgress,
  listSkills,
  saveProgress,
  type ExamSummary,
  type Progress,
  type Skill,
} from '@/lib/study-data';
import { cn } from '@/lib/utils';

import { CelebrationLayer, ProgressBar } from './celebrate';
import { JokePanel } from './JokePanel';
import {
  crossedMilestone,
  encouragement,
  filterSkills,
  formatWeight,
  groupByDomain,
  isMastered,
  movedToday,
  pct,
  statusOf,
  STATUS_SCORE,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_SWATCH,
  tally,
  weightedReadiness,
  type DomainGroup,
  type ProgressMap,
} from './model';
import { ErrorPanel, ProgressRing, Skeleton } from './ui';
import { errorMessage, useAsync } from './use-async';
import { useCelebrations, type Celebration } from './use-celebrations';
import { usePersistentFlag } from './use-persistent-flag';

interface ExamData {
  skills: Skill[];
  progress: Progress[];
}

export function ExamView({ exam, onBack }: { exam: ExamSummary; onBack: () => void }) {
  const load = useCallback(async (): Promise<ExamData> => {
    const [skills, progress] = await Promise.all([listSkills(exam.code), listProgress(exam.code)]);
    return { skills, progress };
  }, [exam.code]);
  const [state, reload] = useAsync(load, exam.code);

  return (
    <section aria-labelledby="exam-title">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-200 rounded-full px-300 py-100 text-300 font-medium text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="icon-size-200" aria-hidden /> All exams
      </button>

      {state.status === 'loading' && (
        <div className="mt-600 space-y-400">
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
          <Skeleton className="h-96" />
        </div>
      )}
      {state.status === 'error' && (
        <div className="mt-600">
          <ErrorPanel message={state.error} onRetry={reload} />
        </div>
      )}
      {state.status === 'ready' && <Tracker exam={exam} data={state.data} />}
    </section>
  );
}

function Tracker({ exam, data }: { exam: ExamSummary; data: ExamData }) {
  const domains = useMemo(() => groupByDomain(data.skills), [data.skills]);
  const [progress, setProgress] = useState<ProgressMap>(
    () => new Map(data.progress.map((p) => [p.skillKey, p])),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState<ReadonlySet<string>>(new Set());
  const [filter, setFilter] = useState<ReadonlySet<SkillStatus>>(new Set());
  const [jokeTick, setJokeTick] = useState(0);
  const [jokesHidden, setJokesHidden] = usePersistentFlag('exam-study-tracker.jokes-hidden');
  const { current, particles, celebrate, dismiss } = useCelebrations();

  // Latest progress for celebration checks after an await (avoids a stale closure).
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const checkAchievements = useCallback(
    (skill: Skill, before: ProgressMap, after: ProgressMap) => {
      const wins: Omit<Celebration, 'id'>[] = [];
      const domain = domains.find((d) => d.number === skill.domainNumber);
      const sub = domain?.subcategories.find((x) => x.number === skill.subcategoryNumber);
      if (isMastered(data.skills, after) && !isMastered(data.skills, before)) {
        wins.push({ kind: 'exam', title: `${exam.code} fully mastered!`, detail: 'Every skill is confident. Go book that exam.' });
      } else if (domain && isMastered(domain.skills, after) && !isMastered(domain.skills, before)) {
        wins.push({ kind: 'domain', title: 'Domain conquered', detail: `${domain.name} is 100% confident.` });
      } else if (sub && isMastered(sub.skills, after) && !isMastered(sub.skills, before)) {
        wins.push({ kind: 'subcategory', title: 'Section mastered', detail: sub.name });
      }
      const milestone = crossedMilestone(weightedReadiness(domains, before), weightedReadiness(domains, after));
      if (milestone != null && milestone < 1) {
        wins.push({
          kind: 'milestone',
          title: `${Math.round(milestone * 100)}% exam ready`,
          detail: milestone >= 0.75 ? 'Almost there. Keep the streak going.' : 'Nice momentum. Keep going!',
        });
      }
      celebrate(wins);
    },
    [celebrate, data.skills, domains, exam.code],
  );

  const setStatus = useCallback(
    async (skill: Skill, status: SkillStatus) => {
      const previous = progress.get(skill.key);
      if ((previous?.status ?? 'not_started') === status) return;
      // Optimistic: show the change now, roll back if Fabric refuses it.
      setProgress((m) => new Map(m).set(skill.key, { id: previous?.id ?? '', skillKey: skill.key, status, updatedAt: new Date() }));
      setSaving((s) => new Set(s).add(skill.key));
      try {
        const saved = await saveProgress(exam.code, skill.key, status, previous?.id || undefined);
        const after = new Map(progressRef.current).set(skill.key, saved);
        const before = new Map(after);
        if (previous) before.set(skill.key, previous);
        else before.delete(skill.key);
        setProgress(after);
        setSaveError(null);
        checkAchievements(skill, before, after);
        // Moving forward earns a fresh joke in the study-break panel.
        if (STATUS_SCORE[status] > STATUS_SCORE[previous?.status ?? 'not_started']) setJokeTick((t) => t + 1);
      } catch (e) {
        setProgress((m) => {
          const next = new Map(m);
          if (previous) next.set(skill.key, previous);
          else next.delete(skill.key);
          return next;
        });
        setSaveError(errorMessage(e));
      } finally {
        setSaving((s) => {
          const next = new Set(s);
          next.delete(skill.key);
          return next;
        });
      }
    },
    [checkAchievements, exam.code, progress],
  );

  if (data.skills.length === 0) {
    return (
      <p className="mt-600 text-400 text-muted-foreground">
        No current skills were found for {exam.code}. Check the latest notebook run in Fabric.
      </p>
    );
  }

  const overall = tally(data.skills, progress);
  const readiness = weightedReadiness(domains, progress);
  const today = movedToday(progress);
  const visible = (selected == null ? domains : domains.filter((d) => d.number === selected))
    .map((d) => ({
      domain: d,
      subs: d.subcategories
        .map((sub) => ({ sub, skills: filterSkills(sub.skills, progress, filter) }))
        .filter((x) => x.skills.length > 0),
    }))
    .filter((x) => x.subs.length > 0);
  const toggleFilter = (st: SkillStatus) =>
    setFilter((f) => {
      const next = new Set(f);
      if (next.has(st)) next.delete(st);
      else next.add(st);
      return next;
    });

  return (
    <div className="mt-400">
      <header className="flex flex-col gap-600 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="font-monospace text-300 text-primary">{exam.code}</p>
          <h1 id="exam-title" className="mt-100 font-heading text-hero-700 font-bold leading-hero-700 sm:text-hero-800 sm:leading-hero-800">
            {exam.title || exam.code}
          </h1>
          <p className="mt-200 flex flex-wrap items-center gap-x-400 gap-y-100 text-300 text-muted-foreground">
            <span>
              {overall.started} of {overall.total} skills started
            </span>
            {exam.lastSynced && <span>Guide synced {exam.lastSynced.toLocaleDateString()}</span>}
            {exam.studyGuideUrl && (
              <a
                href={exam.studyGuideUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-100 font-medium text-primary underline-offset-4 hover:underline"
              >
                Study guide <ExternalLink className="icon-size-200" aria-hidden />
              </a>
            )}
          </p>
          <p className="mt-400 flex flex-wrap items-center gap-300 text-400">
            <span>{encouragement(readiness, overall.started)}</span>
            {today > 0 && (
              <span className="inline-flex items-center gap-100 rounded-full bg-accent px-300 py-100 text-300 font-semibold text-accent-foreground">
                <Flame className="icon-size-200" aria-hidden />
                {today} {today === 1 ? 'skill' : 'skills'} moved forward today
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-500 rounded-4xl border border-border bg-card/90 px-600 py-500 shadow-sm backdrop-blur">
          <ProgressRing value={readiness} size={104} stroke={10} className="[&>span]:text-500" />
          <div>
            <p className="text-300 font-semibold">Exam readiness</p>
            <p className="text-200 text-muted-foreground">Weighted by domain</p>
            <Legend counts={overall.counts} />
          </div>
        </div>
      </header>

      <DomainMap domains={domains} progress={progress} selected={selected} onSelect={setSelected} />

      {saveError && (
        <div className="mt-400">
          <ErrorPanel message={`Your change wasn't saved: ${saveError}`} />
        </div>
      )}

      {/* Flex column below lg (so the pinned panel can stick for the whole list),
          two-column grid with a sticky sidebar from lg up. */}
      <div
        className={cn(
          'mt-800 flex flex-col gap-600',
          !jokesHidden && 'lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start',
        )}
      >
        <div className="min-w-0">
          <FilterBar
            counts={overall.counts}
            filter={filter}
            onToggle={toggleFilter}
            onClear={() => setFilter(new Set())}
            jokesHidden={jokesHidden}
            onShowJokes={() => setJokesHidden(false)}
          />

          <div className="mt-600 space-y-800">
            {visible.map(({ domain, subs }) => (
              <DomainSection key={domain.number} domain={domain} subs={subs} progress={progress} saving={saving} onSet={setStatus} />
            ))}
            {visible.length === 0 && (
              <p className="rounded-3xl border border-dashed border-border p-600 text-center text-400 text-muted-foreground">
                No skills match these filters{selected != null ? ' in this domain' : ''}.
              </p>
            )}
          </div>
        </div>

        {/* Pinned to the top while scrolling: a compact strip on narrow screens,
            a sidebar on wide ones. */}
        {!jokesHidden && (
          <div className="sticky top-200 z-20 order-first lg:top-600 lg:order-none">
            <JokePanel seed={exam.code} tick={jokeTick} movedToday={today} onHide={() => setJokesHidden(true)} />
          </div>
        )}
      </div>

      <CelebrationLayer current={current} particles={particles} onDismiss={dismiss} />
    </div>
  );
}

function FilterBar({
  counts,
  filter,
  onToggle,
  onClear,
  jokesHidden,
  onShowJokes,
}: {
  counts: Record<SkillStatus, number>;
  filter: ReadonlySet<SkillStatus>;
  onToggle: (s: SkillStatus) => void;
  onClear: () => void;
  jokesHidden: boolean;
  onShowJokes: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-200" role="group" aria-label="Filter skills by status">
      <span className="mr-100 text-300 font-semibold">Show</span>
      {STATUS_ORDER.map((s) => {
        const on = filter.has(s);
        return (
          <button
            key={s}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(s)}
            className={cn(
              'inline-flex items-center gap-200 rounded-full border px-400 py-200 text-300 font-medium transition focus-visible:outline-2 focus-visible:outline-ring',
              on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/60',
            )}
          >
            <span className={cn('size-2 rounded-full', STATUS_SWATCH[s])} aria-hidden />
            {STATUS_LABEL[s]}
            <span className={cn('font-numeric', on ? 'opacity-90' : 'text-muted-foreground')}>{counts[s]}</span>
          </button>
        );
      })}
      {filter.size > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-100 rounded-full px-300 py-200 text-300 font-medium text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="icon-size-200" aria-hidden /> Clear
        </button>
      )}
      {jokesHidden && (
        <button
          type="button"
          onClick={onShowJokes}
          className="ml-auto inline-flex items-center gap-100 rounded-full border border-dashed border-border px-300 py-200 text-300 font-medium text-muted-foreground hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Laugh className="icon-size-200" aria-hidden /> Show study break
        </button>
      )}
    </div>
  );
}

function Legend({ counts }: { counts: Record<SkillStatus, number> }) {
  return (
    <ul className="mt-200 flex flex-wrap gap-x-300 gap-y-100">
      {STATUS_ORDER.map((s) => (
        <li key={s} className="inline-flex items-center gap-100 text-200 text-muted-foreground">
          <span className={cn('size-2 rounded-full', STATUS_SWATCH[s])} aria-hidden />
          {STATUS_LABEL[s]} <span className="font-numeric text-foreground">{counts[s]}</span>
        </li>
      ))}
    </ul>
  );
}

/** Tiles sized by published exam weight; each fills with the domain's readiness. */
function DomainMap({
  domains,
  progress,
  selected,
  onSelect,
}: {
  domains: DomainGroup[];
  progress: ProgressMap;
  selected: number | null;
  onSelect: (n: number | null) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <nav aria-label="Exam domains" className="mt-800">
      <div className="mb-300 flex items-center justify-between">
        <h2 className="font-heading text-500 font-semibold">Exam map</h2>
        {selected != null && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="rounded-full px-300 py-100 text-300 font-medium text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-ring"
          >
            Show all domains
          </button>
        )}
      </div>
      <div className="flex flex-col gap-300 md:flex-row">
        {domains.map((d, i) => {
          const t = tally(d.skills, progress);
          const active = selected === d.number;
          return (
            <motion.button
              key={d.number}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : d.number)}
              style={{ flexGrow: d.weight || 1, flexBasis: 0 }}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.07 * i, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduce ? undefined : { y: -3 }}
              className={cn(
                'relative min-h-40 overflow-hidden rounded-3xl border bg-card/90 p-500 text-left shadow-sm backdrop-blur transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                active ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/60',
              )}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-status-studying via-status-reviewed to-status-confident"
                style={{ opacity: 0.25 + t.readiness * 0.75 }}
              />
              <span className="relative flex h-full flex-col">
                <span className="font-numeric text-hero-700 font-bold leading-hero-700 text-primary">
                  {formatWeight(d) || `D${d.number}`}
                </span>
                <span className="mt-200 font-heading text-400 font-semibold leading-400">{d.name}</span>
                <span className="mt-auto pt-400">
                  <ProgressBar value={t.readiness} label={`${t.started}/${t.total} started`} />
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

function DomainSection({
  domain,
  subs,
  progress,
  saving,
  onSet,
}: {
  domain: DomainGroup;
  subs: { sub: DomainGroup['subcategories'][number]; skills: Skill[] }[];
  progress: ProgressMap;
  saving: ReadonlySet<string>;
  onSet: (skill: Skill, status: SkillStatus) => void;
}) {
  const t = tally(domain.skills, progress);
  return (
    <section
      aria-labelledby={`domain-${domain.number}`}
      className="rounded-4xl border border-border bg-secondary/60 p-400 sm:p-600"
    >
      <div className="flex items-center gap-400 border-b border-border pb-400">
        <ProgressRing value={t.readiness} size={44} stroke={5} label={null} />
        <div>
          <h2 id={`domain-${domain.number}`} className="font-heading text-500 font-semibold leading-500">
            {domain.name}
          </h2>
          <p className="text-300 text-muted-foreground">
            {formatWeight(domain) && `${formatWeight(domain)} of the exam · `}
            {pct(t.readiness)} ready
          </p>
        </div>
      </div>

      <div className="mt-500 flex flex-col gap-400">
        {subs.map(({ sub, skills }) => {
          const st = tally(sub.skills, progress);
          const done = st.readiness >= 1;
          return (
          <div
            key={sub.number}
            className={cn('rounded-3xl border bg-card p-500 transition-colors', done ? 'border-status-confident' : 'border-border')}
          >
            <h3 className="flex items-center justify-between gap-300 text-400 font-semibold">
              <span>{sub.name}</span>
              {done && (
                <span className="shrink-0 rounded-full bg-accent px-300 py-100 text-200 font-semibold text-accent-foreground">
                  Mastered
                </span>
              )}
            </h3>
            <ul className="mt-300 divide-y divide-border">
              {skills.map((skill) => (
                <SkillRow
                  key={skill.key}
                  skill={skill}
                  status={statusOf(progress, skill.key)}
                  saving={saving.has(skill.key)}
                  onSet={onSet}
                />
              ))}
            </ul>
            <ProgressBar value={st.readiness} label={`${st.counts.confident} of ${st.total} confident`} />
          </div>
          );
        })}
      </div>
    </section>
  );
}

function SkillRow({
  skill,
  status,
  saving,
  onSet,
}: {
  skill: Skill;
  status: SkillStatus;
  saving: boolean;
  onSet: (skill: Skill, status: SkillStatus) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <li className="flex flex-col gap-200 py-300 md:flex-row md:items-center md:gap-500">
      <span className={cn('min-w-0 flex-1 text-300', status === 'confident' && 'text-muted-foreground')}>
        {skill.text}
      </span>
      <div
        role="radiogroup"
        aria-label={`Status for ${skill.text}`}
        aria-busy={saving}
        className={cn('flex max-w-full shrink-0 flex-wrap self-start rounded-3xl bg-muted p-100 md:self-auto', saving && 'opacity-70')}
      >
        {STATUS_ORDER.map((s) => {
          const on = s === status;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={on}
              title={STATUS_LABEL[s]}
              disabled={saving}
              onClick={() => onSet(skill, s)}
              className={cn(
                'relative inline-flex items-center gap-100 rounded-full px-300 py-100 text-200 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {on && (
                // The white pill glides to whichever status is selected.
                <motion.span
                  layoutId={reduce ? undefined : `pill-${skill.key}`}
                  className="absolute inset-0 rounded-full bg-card shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <span className="relative inline-flex items-center gap-100">
                <AnimatePresence initial={false} mode="popLayout">
                  {on && s === 'confident' ? (
                    <motion.span
                      key="check"
                      initial={reduce ? false : { scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                      className="grid size-3.5 place-items-center rounded-full bg-status-confident text-primary-foreground"
                      aria-hidden
                    >
                      <Check className="size-2.5" strokeWidth={3.5} />
                    </motion.span>
                  ) : (
                    <span key="dot" className={cn('size-2 rounded-full', STATUS_SWATCH[s])} aria-hidden />
                  )}
                </AnimatePresence>
                <span className={cn(!on && 'sr-only sm:not-sr-only')}>{STATUS_LABEL[s]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </li>
  );
}
