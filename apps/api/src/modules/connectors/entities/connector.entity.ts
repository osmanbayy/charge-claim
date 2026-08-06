import { connectors } from '../../../core/database/postgres/drizzle/schema/connectors.schema';

export const CONNECTOR_CURRENT_STATUSES = [
  'MAINTENANCE',
  'OCCUPIED',
  'RESERVED',
  'AVAILABLE',
] as const;
export type ConnectorCurrentStatus =
  (typeof CONNECTOR_CURRENT_STATUSES)[number];

export type ConnectorEntity = typeof connectors.$inferSelect;

export type NewConnectorEntity = typeof connectors.$inferInsert;

export type ConnectorWithCurrentStatus = ConnectorEntity & {
  currentStatus: ConnectorCurrentStatus;
};

export type UpdateConnectorEntity = Partial<
  Pick<NewConnectorEntity, 'code' | 'type' | 'powerKw' | 'pricePerKWh'>
>;
