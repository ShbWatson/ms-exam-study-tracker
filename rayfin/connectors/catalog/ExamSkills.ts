import { boolean, date, entity, int, role, text } from '@microsoft/rayfin-core';
import { Source } from '@microsoft/rayfin-connectors';

/** One row per skill in the ExamCatalog lakehouse (written by SyncExamStudyGuides). Read-only. */
@role('authenticated', ['read'])
@entity()
export class ExamSkills extends Source({ schema: 'dbo', table: 'exam_skills', primaryKey: [] }) {
  @text({ optional: true, column: 'skill_key', max: 8000 }) skillKey?: string;
  @text({ optional: true, max: 8000 }) exam?: string;
  @int({ optional: true, column: 'domain_number' }) domainNumber?: number;
  @text({ optional: true, max: 8000 }) domain?: string;
  @text({ optional: true, column: 'domain_name', max: 8000 }) domainName?: string;
  @int({ optional: true, column: 'weight_min' }) weightMin?: number;
  @int({ optional: true, column: 'weight_max' }) weightMax?: number;
  @int({ optional: true, column: 'subcategory_number' }) subcategoryNumber?: number;
  @text({ optional: true, max: 8000 }) subcategory?: string;
  @int({ optional: true, column: 'skill_number' }) skillNumber?: number;
  @text({ optional: true, max: 8000 }) skill?: string;
  @boolean({ optional: true, column: 'is_current' }) isCurrent?: boolean;
  @date({ optional: true, column: 'last_seen_utc' }) lastSeenUtc?: Date;
}