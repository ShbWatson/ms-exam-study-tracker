// Clean, original one-liners for the study-break panel. Keep them kind:
// poke fun at the work, never at people.
export type JokeKind = 'data' | 'office';

export interface Joke {
  kind: JokeKind;
  text: string;
}

export const JOKES: readonly Joke[] = [
  { kind: 'data', text: 'A SQL query walks into a bar, sees two tables and asks, "Mind if I join you?"' },
  { kind: 'office', text: '"Let\'s take this offline" is meeting-speak for "see you never."' },
  { kind: 'data', text: 'I told my DAX measure a joke. It didn\'t get it. Wrong filter context.' },
  { kind: 'office', text: 'This meeting could have been an email. That email could have been a dashboard.' },
  { kind: 'data', text: 'My data model and I are in a relationship. It\'s one-to-many, but it works.' },
  { kind: 'office', text: '"Per my last email" is office for "I have the receipts."' },
  { kind: 'data', text: 'Why did the null go to therapy? It felt like it didn\'t count.' },
  { kind: 'office', text: '"Quick question" are the two most misleading words in any chat.' },
  { kind: 'data', text: 'Delta tables never hold grudges. They just remember every version of what you did.' },
  { kind: 'office', text: 'We don\'t have scope creep. We have scope enthusiasm.' },
  { kind: 'data', text: 'Data cleaning is 80% of the job. The other 20% is talking about data cleaning.' },
  { kind: 'office', text: 'Our weekly status meeting now has its own status meeting.' },
  { kind: 'data', text: 'Star schemas never get lost. They always know their dimensions.' },
  { kind: 'office', text: 'The project is 90% done. The last 10% just needs the other 90% of the time.' },
  { kind: 'data', text: 'Why did the CSV feel insecure? Everyone kept saying it had no structure.' },
  { kind: 'office', text: '"Circle back" is the only cardio some projects ever get.' },
  { kind: 'data', text: 'I asked the semantic model out for a date. It said, "Mark me as a date table first."' },
  { kind: 'office', text: 'Reply-all: the office\'s favorite extreme sport.' },
  { kind: 'data', text: 'My pipeline failed at 2 a.m. Classic late-arriving dimension.' },
  { kind: 'office', text: 'A stakeholder wants the dashboard yesterday and the requirements tomorrow.' },
  { kind: 'data', text: 'The Power BI report joined a gym. It wanted to work on its visuals.' },
  { kind: 'office', text: '"You\'re on mute" is the most-said sentence of the decade.' },
  { kind: 'data', text: 'My code has no bugs, only undocumented features that ship to production.' },
  { kind: 'office', text: 'My calendar is like my data: full of duplicates that nobody owns.' },
  { kind: 'data', text: 'Why are lakehouses so relaxed? They believe in schema-on-read, and on-read only.' },
  { kind: 'office', text: 'I\'m not procrastinating. I\'m letting the requirements mature.' },
  { kind: 'data', text: 'Normalization is just your data learning to share responsibilities.' },
  { kind: 'office', text: 'Every "five-minute sync" has a secret sequel called "the other forty."' },
];

/** Stable starting point per exam so each exam opens on a different joke. */
export function startIndex(seed: string): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % JOKES.length;
}
