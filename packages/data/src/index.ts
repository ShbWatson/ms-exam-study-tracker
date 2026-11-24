import { MyExam } from './MyExam.js';
import { SkillProgress } from './SkillProgress.js';
import type { UniversalAppSchema } from '@rayfin-app/shared';

/**
 * The app's Rayfin data schema. Keep in step with UniversalAppSchema in
 * @rayfin-app/shared so (await getRayfinClient()).data.<Entity> stays typed.
 */
export type { UniversalAppSchema };
export { MyExam, SkillProgress };

export const schema = [MyExam, SkillProgress];