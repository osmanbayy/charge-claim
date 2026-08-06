import { stations } from '../../../core/database/postgres/drizzle/schema';
import type { ConnectorWithCurrentStatus } from '../../connectors/entities/connector.entity';

export type StationEntity = typeof stations.$inferSelect;

export type NewStationEntity = typeof stations.$inferInsert;

export type StationWithConnectors = StationEntity & {
  connectors: ConnectorWithCurrentStatus[];
};
