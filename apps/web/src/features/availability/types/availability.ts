import type { ConnectorType } from '@/features/stations/types/station';

export interface AvailabilityQueryParams {
  startAt: string;
  endAt: string;
  district?: string;
  connectorType?: ConnectorType;
  minPowerKw?: number;
}

export interface AvailableConnector {
  id: number;
  code: string;
  type: ConnectorType;
  powerKw: string;
  pricePerKWh: string;
}

export interface AvailableStation {
  id: number;
  name: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  connectors: AvailableConnector[];
}

export interface AvailabilityResponse {
  range: {
    startAt: string;
    endAt: string;
  };
  summary: {
    availableStationCount: number;
    availableConnectorCount: number;
  };
  stations: AvailableStation[];
}