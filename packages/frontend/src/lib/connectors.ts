import type {
  ConnectorConfigs,
  ConnectorsRuntime,
} from '@microsoft/rayfin-connectors';
import {
  connectorConfig as catalogConfig,
  type CatalogSchema,
} from '../../../../rayfin/connectors/catalog/schema';

export type AppConnectorsSchema = {
  'catalog': CatalogSchema;
};

export const connectorConfigs: ConnectorConfigs<AppConnectorsSchema> = {
  'catalog': catalogConfig,
};

// The lakehouse connector has no client-side runtime; reads use the default pass-through.
export const connectorRuntimes: ConnectorsRuntime = {};