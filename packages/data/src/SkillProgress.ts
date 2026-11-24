import { date, entity, role, set, text, uuid } from '@microsoft/rayfin-core';

/**
 * One row per user per skill they have touched.
 * skill_key matches exam_skills.skill_key in the ExamCatalog lakehouse; it
 * survives Microsoft renumbering the study guide.
 */
@entity()
@role('authenticated', '*', {
  policy: (claims, item) => claims.sub.eq(item.owner_id),
})
export class SkillProgress {
  @uuid() id!: string;
  @text({ min: 1, max: 20 }) exam_code!: string;
  @text({ min: 1, max: 32 }) skill_key!: string;
  @set({ default: 'not_started' }, 'not_started', 'studying', 'reviewed', 'confident')
  status!: 'not_started' | 'studying' | 'reviewed' | 'confident';
  @text({ optional: true, max: 2000 }) notes?: string;
  @date() updated_at!: Date;
  @text({ max: 200 }) owner_id!: string;
}