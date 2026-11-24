/**
 * Browser-safe contracts shared by the data package and the frontend.
 * Keep each shape aligned with its decorated entity in @rayfin-app/data.
 * Do not import the decorated classes here.
 */
export type SkillStatus = 'not_started' | 'studying' | 'reviewed' | 'confident';

export const SKILL_STATUSES: readonly SkillStatus[] = [
  'not_started',
  'studying',
  'reviewed',
  'confident',
];

export interface MyExamRecord {
  id: string;
  exam_code: string;
  target_date?: Date;
  added_at: Date;
  owner_id: string;
}

export interface SkillProgressRecord {
  id: string;
  exam_code: string;
  skill_key: string;
  status: SkillStatus;
  notes?: string;
  updated_at: Date;
  owner_id: string;
}

export type UniversalAppSchema = {
  MyExam: MyExamRecord;
  SkillProgress: SkillProgressRecord;
};