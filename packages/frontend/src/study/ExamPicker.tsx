import type { SkillStatus } from '@rayfin-app/shared';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCallback } from 'react';

import { listExams, listProgressByExam, type ExamSummary, type Progress } from '@/lib/study-data';

import { STATUS_SCORE } from './model';
import { StudyOwl } from './StudyOwl';
import { ErrorPanel, ProgressRing, Skeleton } from './ui';
import { useAsync } from './use-async';

interface PickerData {
  exams: ExamSummary[];
  progress: Map<string, Progress[]>;
}

/** Unweighted readiness for a card: average status score over the exam's skills. */
function cardReadiness(exam: ExamSummary, rows: Progress[] | undefined) {
  const started = (rows ?? []).filter((p) => p.status !== 'not_started').length;
  const score = (rows ?? []).reduce((a, p) => a + STATUS_SCORE[p.status as SkillStatus], 0);
  const readiness = exam.skillCount ? Math.min(1, score / exam.skillCount) : 0;
  return { started: Math.min(started, exam.skillCount), readiness };
}

export function ExamPicker({ onPick }: { onPick: (exam: ExamSummary) => void }) {
  const reduce = useReducedMotion();
  const load = useCallback(async (): Promise<PickerData> => {
    // Progress is a nice-to-have on the cards; the picker still works without it.
    const [exams, progress] = await Promise.all([
      listExams(),
      listProgressByExam().catch(() => new Map<string, Progress[]>()),
    ]);
    return { exams, progress };
  }, []);
  const [state, reload] = useAsync(load, 'exams');

  return (
    <section aria-labelledby="picker-title">
      <div className="grid items-center gap-600 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-200 rounded-full border border-primary/25 bg-card/70 px-300 py-100 text-300 font-medium text-primary backdrop-blur">
            <Sparkles className="icon-size-200" aria-hidden />
            Built on Microsoft Fabric
          </p>
          <h1
            id="picker-title"
            className="mt-400 font-heading text-hero-900 font-bold leading-hero-900 sm:text-hero-1000 sm:leading-hero-1000"
          >
            Map the exam.{' '}
            <span className="bg-gradient-to-r from-status-confident via-primary to-status-reviewed bg-clip-text text-transparent">
              Track every skill.
            </span>
          </h1>
          <p className="mt-400 max-w-2xl text-400 text-muted-foreground">
            Each exam's skills come straight from its Microsoft Learn study guide, synced daily into Fabric.
            Pick one to see how the exam is weighted and where you stand.
          </p>
        </div>
        {/* Mascot fills the space beside the headline on wide screens. */}
        <StudyOwl className="hidden w-full lg:block" />
      </div>

      <div className="mt-800 grid gap-400 sm:grid-cols-2 lg:grid-cols-3">
        {state.status === 'loading' && [0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)}
        {state.status === 'error' && (
          <div className="sm:col-span-2 lg:col-span-3">
            <ErrorPanel message={state.error} onRetry={reload} />
          </div>
        )}
        {state.status === 'ready' && state.data.exams.length === 0 && (
          <p className="text-400 text-muted-foreground sm:col-span-2 lg:col-span-3">
            No exams are in the catalog yet. Run the SyncExamStudyGuides notebook in Fabric, then refresh.
          </p>
        )}
        {state.status === 'ready' &&
          state.data.exams.map((exam, i) => {
            const { started, readiness } = cardReadiness(exam, state.data.progress.get(exam.code));
            return (
              <motion.button
                key={exam.code}
                type="button"
                onClick={() => onPick(exam)}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduce ? undefined : { y: -4 }}
                className="group relative flex flex-col overflow-hidden rounded-4xl border border-border bg-card/90 p-600 text-left shadow-sm backdrop-blur transition-shadow hover:border-primary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {/* Accent stripe that brightens on hover. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-status-studying via-status-reviewed to-status-confident opacity-60 transition-opacity group-hover:opacity-100"
                />
                <span className="flex items-start justify-between gap-400">
                  <span className="rounded-full bg-accent px-300 py-100 font-monospace text-300 text-accent-foreground">
                    {exam.code}
                  </span>
                  <ProgressRing value={readiness} size={60} stroke={6} />
                </span>
                <span className="mt-400 font-heading text-500 font-semibold leading-500">{exam.title || exam.code}</span>
                <span className="mt-auto flex items-center justify-between pt-600 text-300 text-muted-foreground">
                  <span>
                    {started > 0
                      ? `${started} of ${exam.skillCount} skills started`
                      : `${exam.domainCount} domains · ${exam.skillCount} skills`}
                  </span>
                  <span className="inline-flex items-center gap-100 font-medium text-primary">
                    {started > 0 ? 'Continue' : 'Start'}
                    <ArrowRight className="icon-size-300 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </span>
              </motion.button>
            );
          })}
      </div>
    </section>
  );
}
