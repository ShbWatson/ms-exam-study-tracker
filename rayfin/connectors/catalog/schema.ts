import type { GraphQLBackedConnector } from '@microsoft/rayfin-connector-fabric-graphql';
import type { ConnectorConfig } from '@microsoft/rayfin-connectors';

import { Exams } from './Exams.js';
import { ExamSkills } from './ExamSkills.js';

export { Exams } from './Exams.js';
export { ExamSkills } from './ExamSkills.js';

// `as const satisfies` keeps the literals the client reads for verbs and dialect.
export const connectorConfig = {
  connector: 'fabric-sqlanalytics',
  operations: ['read'],
  entities: { Exams, ExamSkills },
} as const satisfies ConnectorConfig;

export type CatalogSchema = GraphQLBackedConnector<
  { Exams: typeof Exams; ExamSkills: typeof ExamSkills },
  typeof connectorConfig
>;