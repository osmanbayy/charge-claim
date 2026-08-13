export type ConnectorType = "TYPE_2" | "CCS2";

export type ConnectorOperationalStatus =
  | "ACTIVE"
  | "MAINTENANCE";

export type ConnectorCurrentStatus =
  | "MAINTENANCE"
  | "OCCUPIED"
  | "RESERVED"
  | "AVAILABLE";

export interface Connector {
  id: number;
  stationId: number;
  code: string;
  type: ConnectorType;
  powerKw: string;
  pricePerKWh: string;
  operationalStatus: ConnectorOperationalStatus;
  currentStatus: ConnectorCurrentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Station {
  id: number;
  name: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  connectors: Connector[];
}

export interface CreateStationInput {
  name: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
}

export type UpdateStationInput = Partial<CreateStationInput>;

export interface CreateConnectorInput {
  code: string;
  type: ConnectorType;
  powerKw: string;
  pricePerKWh: string;
}

export type CreatedStation = Omit<Station, "connectors">;
