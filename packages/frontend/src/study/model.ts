import type { SkillStatus } from '@rayfin-app/shared';

import type { Progress, Skill } from '@/lib/study-data';

export const STATUS_ORDER: readonly SkillStatus[] = ['not_started', 'studying', 'reviewed', 'confident'];

export const STATUS_LABEL: Record<SkillStatus, string> = {
  not_started: 'Not started',
  studying: 'Studying',
  reviewed: 'Reviewed',
  confident: 'Confident',
};

/** How far along a status is, 0..1. Readiness is the average of these. */
export const STATUS_SCORE: Record<SkillStatus, number> = {
  not_started: 0,
  studying: 1 / 3,
  reviewed: 2 / 3,
  confident: 1,
};

/** Tailwind classes for the status swatch (tokens live in global.css). */
export const STATUS_SWATCH: Record<SkillStatus, string> = {
  not_started: 'bg-status-none',
  studying: 'bg-status-studying',
  reviewed: 'bg-status-reviewed',
  confident: 'bg-status-confident',
};

export function nextStatus(s: SkillStatus): SkillStatus {
  return STATUS_ORDER[(STATUS_ORDER.indexOf(s) + 1) % STATUS_ORDER.length];
}

export interface SubcategoryGroup {
  number: number;
  name: string;
  skills: Skill[];
}

export interface DomainGroup {
  number: number;
  name: string;
  weightMin: number | null;
  weightMax: number | null;
  /** Midpoint of the published weight range, or an even share when absent. */
  weight: number;
  subcategories: SubcategoryGroup[];
  skills: Skill[];
}

export function groupByDomain(skills: readonly Skill[]): DomainGroup[] {
  const domains = new Map<number, DomainGroup>();
  for (const s of skills) {
    let d = domains.get(s.domainNumber);
    if (!d) {
      const w = s.weightMin != null && s.weightMax != null ? (s.weightMin + s.weightMax) / 2 : 0;
      d = {
        number: s.domainNumber,
        name: s.domainName,
        weightMin: s.weightMin,
        weightMax: s.weightMax,
        weight: w,
        subcategories: [],
        skills: [],
      };
      domains.set(s.domainNumber, d);
    }
    d.skills.push(s);
    let sub = d.subcategories.find((x) => x.number === s.subcategoryNumber);
    if (!sub) {
      sub = { number: s.subcategoryNumber, name: s.subcategory, skills: [] };
      d.subcategories.push(sub);
    }
    sub.skills.push(s);
  }
  const list = [...domains.values()].sort((a, b) => a.number - b.number);
  if (list.length && list.every((d) => d.weight === 0)) list.forEach((d) => (d.weight = 100 / list.length));
  return list;
}

export type ProgressMap = ReadonlyMap<string, Progress>;

export function statusOf(map: ProgressMap, skillKey: string): SkillStatus {
  return map.get(skillKey)?.status ?? 'not_started';
}

export interface Tally {
  total: number;
  started: number;
  /** 0..1 average of STATUS_SCORE across skills. */
  readiness: number;
  counts: Record<SkillStatus, number>;
}

export function tally(skills: readonly Skill[], map: ProgressMap): Tally {
  const counts: Record<SkillStatus, number> = { not_started: 0, studying: 0, reviewed: 0, confident: 0 };
  let score = 0;
  for (const s of skills) {
    const st = statusOf(map, s.key);
    counts[st] += 1;
    score += STATUS_SCORE[st];
  }
  const total = skills.length;
  return { total, started: total - counts.not_started, readiness: total ? score / total : 0, counts };
}

/** Exam-weighted readiness: each domain counts by its published weight. */
export function weightedReadiness(domains: readonly DomainGroup[], map: ProgressMap): number {
  const totalWeight = domains.reduce((a, d) => a + d.weight, 0);
  if (!totalWeight) return 0;
  return domains.reduce((a, d) => a + tally(d.skills, map).readiness * d.weight, 0) / totalWeight;
}

export function formatWeight(d: Pick<DomainGroup, 'weightMin' | 'weightMax'>): string {
  return d.weightMin != null && d.weightMax != null ? `${d.weightMin}–${d.weightMax}%` : '';
}

export const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Skills whose current status is in `filter` (an empty filter means everything). */
export function filterSkills(
  skills: readonly Skill[],
  map: ProgressMap,
  filter: ReadonlySet<SkillStatus>,
): Skill[] {
  return filter.size === 0 ? [...skills] : skills.filter((s) => filter.has(statusOf(map, s.key)));
}

export const isMastered = (skills: readonly Skill[], map: ProgressMap) =>
  skills.length > 0 && skills.every((s) => statusOf(map, s.key) === 'confident');

/** Readiness milestones that earn a celebration when crossed upward. */
export const MILESTONES = [0.25, 0.5, 0.75, 1] as const;

export function crossedMilestone(before: number, after: number): number | null {
  // Round to whole percents so float noise can't skip or repeat a milestone.
  const b = Math.round(before * 100);
  const a = Math.round(after * 100);
  const hit = MILESTONES.filter((m) => b < m * 100 && a >= m * 100);
  return hit.length ? hit[hit.length - 1] : null;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Skills the user moved to a non-"not started" status today. */
export function movedToday(map: ProgressMap, now = new Date()): number {
  let n = 0;
  for (const p of map.values()) if (p.status !== 'not_started' && p.updatedAt && isSameDay(p.updatedAt, now)) n += 1;
  return n;
}

/** A short line of encouragement that matches where the user is. */
export function encouragement(readiness: number, started: number): string {
  if (started === 0) return 'Pick any skill and mark it Studying to light up the map.';
  if (readiness >= 1) return 'Every skill is confident. You are ready for exam day.';
  if (readiness >= 0.75) return 'The home stretch. Turn your reviewed skills into confident ones.';
  if (readiness >= 0.5) return 'Past halfway. Your heaviest domain is the best place to push next.';
  if (readiness >= 0.25) return 'Real momentum. Keep moving skills from Studying to Reviewed.';
  return 'Off to a strong start. Small, steady steps add up fast.';
}
