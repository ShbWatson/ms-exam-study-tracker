import { date, entity, int, role, text } from '@microsoft/rayfin-core';
import { Source } from '@microsoft/rayfin-connectors';

/** One row per exam in the ExamCatalog lakehouse (written by SyncExamStudyGuides). Read-only. */
@role('authenticated', ['read'])
@entity()
export class Exams extends Source({ schema: 'dbo', table: 'exams', primaryKey: [] }) {
  @text({ optional: true, column: 'exam_code', max: 8000 }) examCode?: string;
  @text({ optional: true, max: 8000 }) title?: string;
  @text({ optional: true, column: 'study_guide_url', max: 8000 }) studyGuideUrl?: string;
  @int({ optional: true, column: 'domain_count' }) domainCount?: number;
  @int({ optional: true, column: 'skill_count' }) skillCount?: number;
  @date({ optional: true, column: 'last_synced_utc' }) lastSyncedUtc?: Date;
}