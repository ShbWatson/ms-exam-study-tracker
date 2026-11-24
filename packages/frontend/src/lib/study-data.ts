import type { SkillStatus } from '@rayfin-app/shared';

import { getRayfinClient } from './rayfin-client';

/** One exam from the ExamCatalog lakehouse (`exams` table). */
export interface ExamSummary {
  code: string;
  title: string;
  studyGuideUrl: string | null;
  skillCount: number;
  domainCount: number;
  lastSynced: Date | null;
}

/** One skill from the ExamCatalog lakehouse (`exam_skills` table). */
export interface Skill {
  key: string;
  exam: string;
  domainNumber: number;
  domainName: string;
  weightMin: number | null;
  weightMax: number | null;
  subcategoryNumber: number;
  subcategory: string;
  skillNumber: number;
  text: string;
}

/** The signed-in user's status for one skill (app database). */
export interface Progress {
  id: string;
  skillKey: string;
  status: SkillStatus;
  /** When the status last changed; drives "moved forward today". */
  updatedAt: Date | null;
}

// Connector rows come back with every column optional (the lakehouse reports
// them as nullable) and dates possibly as wire strings, so normalise here once.
const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
const num = (v: unknown): number | null => {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const date = (v: unknown): Date | null => {
  if (v == null || v === '') return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
};
const bool = (v: unknown): boolean => v === true || v === 'true' || v === 1;

export async function listExams(): Promise<ExamSummary[]> {
  const client = await getRayfinClient();
  const rows = await client.connectors.catalog.Exams
    .select(['examCode', 'title', 'studyGuideUrl', 'skillCount', 'domainCount', 'lastSyncedUtc'])
    .orderBy({ examCode: 'asc' })
    .first(200)
    .execute();

  return rows
    .map((r) => ({
      code: str(r.examCode),
      title: str(r.title),
      studyGuideUrl: str(r.studyGuideUrl) || null,
      skillCount: num(r.skillCount) ?? 0,
      domainCount: num(r.domainCount) ?? 0,
      lastSynced: date(r.lastSyncedUtc),
    }))
    .filter((e) => e.code !== '');
}

export async function listSkills(examCode: string): Promise<Skill[]> {
  const client = await getRayfinClient();
  const rows = await client.connectors.catalog.ExamSkills
    .select([
      'skillKey', 'exam', 'domainNumber', 'domainName', 'weightMin', 'weightMax',
      'subcategoryNumber', 'subcategory', 'skillNumber', 'skill', 'isCurrent',
    ])
    .where({ exam: { eq: examCode } })
    .orderBy({ skillNumber: 'asc' })
    .first(1000)
    .execute();

  return rows
    .filter((r) => bool(r.isCurrent) && str(r.skillKey) !== '')
    .map((r) => ({
      key: str(r.skillKey),
      exam: str(r.exam),
      domainNumber: num(r.domainNumber) ?? 0,
      domainName: str(r.domainName),
      weightMin: num(r.weightMin),
      weightMax: num(r.weightMax),
      subcategoryNumber: num(r.subcategoryNumber) ?? 0,
      subcategory: str(r.subcategory),
      skillNumber: num(r.skillNumber) ?? 0,
      text: str(r.skill),
    }));
}

function currentUserId(client: Awaited<ReturnType<typeof getRayfinClient>>): string {
  const session = client.auth.getSession();
  if (!session.isAuthenticated || !session.user) throw new Error('You are not signed in.');
  return session.user.id;
}

/** All progress rows for one exam. The @role policy already limits rows to the caller. */
export async function listProgress(examCode: string): Promise<Progress[]> {
  const client = await getRayfinClient();
  const rows = await client.data.SkillProgress
    .select(['id', 'skill_key', 'status', 'updated_at'])
    .where({ exam_code: { eq: examCode } })
    .first(1000)
    .execute();

  return rows.map((r) => ({
    id: str(r.id),
    skillKey: str(r.skill_key),
    status: (str(r.status) || 'not_started') as SkillStatus,
    updatedAt: date(r.updated_at),
  }));
}

/** Create or update the caller's status for one skill. */
export async function saveProgress(
  examCode: string,
  skillKey: string,
  status: SkillStatus,
  existingId: string | undefined,
): Promise<Progress> {
  const client = await getRayfinClient();
  const now = new Date();

  if (existingId) {
    await client.data.SkillProgress.update({ id: existingId }, { status, updated_at: now });
    return { id: existingId, skillKey, status, updatedAt: now };
  }

  const created = await client.data.SkillProgress.create({
    exam_code: examCode,
    skill_key: skillKey,
    status,
    updated_at: now,
    owner_id: currentUserId(client),
  });
  return { id: str(created.id), skillKey, status, updatedAt: now };
}

/** The caller's status counts for every exam, for the picker cards. One query. */
export async function listProgressByExam(): Promise<Map<string, Progress[]>> {
  const client = await getRayfinClient();
  const rows = await client.data.SkillProgress
    .select(['id', 'exam_code', 'skill_key', 'status', 'updated_at'])
    .first(5000)
    .execute();

  const byExam = new Map<string, Progress[]>();
  for (const r of rows) {
    const code = str(r.exam_code);
    const list = byExam.get(code) ?? [];
    list.push({
      id: str(r.id),
      skillKey: str(r.skill_key),
      status: (str(r.status) || 'not_started') as SkillStatus,
      updatedAt: date(r.updated_at),
    });
    byExam.set(code, list);
  }
  return byExam;
}

/**
 * Start over: delete every progress row (and every saved exam) for the caller.
 * The @role policy already limits these queries and deletes to the caller's own rows.
 * Deletes go by primary key, a few at a time. Returns how many rows were removed.
 */
export async function resetAllProgress(): Promise<number> {
  const client = await getRayfinClient();
  const [progress, exams] = await Promise.all([
    client.data.SkillProgress.select(['id']).first(5000).execute(),
    client.data.MyExam.select(['id']).first(1000).execute(),
  ]);

  const jobs: (() => Promise<unknown>)[] = [
    ...progress.map((r) => () => client.data.SkillProgress.delete({ id: str(r.id) })),
    ...exams.map((r) => () => client.data.MyExam.delete({ id: str(r.id) })),
  ];

  let done = 0;
  const failures: unknown[] = [];
  for (let i = 0; i < jobs.length; i += 8) {
    const results = await Promise.allSettled(jobs.slice(i, i + 8).map((job) => job()));
    for (const r of results) {
      if (r.status === 'fulfilled') done += 1;
      else failures.push(r.reason);
    }
  }
  if (failures.length) {
    throw new Error(`Reset removed ${done} of ${jobs.length} records. Try again to finish.`);
  }
  return done;
}
