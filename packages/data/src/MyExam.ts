import { date, entity, role, text, uuid } from '@microsoft/rayfin-core';

/**
 * An exam the signed-in user has added to their dashboard.
 * owner_id must be set to the signed-in user's id on create; the policy
 * refuses any other value and hides other users' rows.
 */
@entity()
@role('authenticated', '*', {
  policy: (claims, item) => claims.sub.eq(item.owner_id),
})
export class MyExam {
  @uuid() id!: string;
  @text({ min: 1, max: 20 }) exam_code!: string;
  @date({ optional: true }) target_date?: Date;
  @date() added_at!: Date;
  @text({ max: 200 }) owner_id!: string;
}