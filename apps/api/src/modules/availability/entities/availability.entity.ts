import type { ConnectorType } from '../../../core/database/postgres/drizzle/schema';
import type { ConnectorEntity } from '../../connectors/entities/connector.entity';
import type { StationEntity } from '../../stations/entities/station.entity';

export interface AvailableConnectorRow {
  station: Pick<
    StationEntity,
    'id' | 'name' | 'district' | 'address' | 'latitude' | 'longitude'
  >;

  connector: Pick<
    ConnectorEntity,
    'id' | 'stationId' | 'code' | 'type' | 'powerKw' | 'pricePerKWh'
  >;
}

export interface AvailabilityFilters {
  district?: string;
  connectorType?: ConnectorType;
  minPowerKw?: number;
}
