import {
  ConnectorCurrentStatus,
  connectors,
} from '../../../core/database/postgres/drizzle/schema/connectors.schema';

export type ConnectorEntity = typeof connectors.$inferSelect;

export type NewConnectorEntity = typeof connectors.$inferInsert;

export type ConnectorWithCurrentStatus = ConnectorEntity & {
  currentStatus: ConnectorCurrentStatus;
};
