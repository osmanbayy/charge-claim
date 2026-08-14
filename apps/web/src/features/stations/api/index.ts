import { apiClient } from "@/lib/api/client";
import type { Connector, ConnectorOperationalStatus, CreatedStation, CreateConnectorInput, CreateStationInput, Station, UpdateStationInput, PaginatedStations } from "../types/station";

export async function createStation(createStatiionInput: CreateStationInput): Promise<CreatedStation> {
  const response = await apiClient.post<CreatedStation>("/stations", createStatiionInput);

  return response.data;
}

export async function getStations(): Promise<Station[]> {
  const response =
    await apiClient.get<Station[]>("/stations");

  return response.data;
}

export async function getStationPage(page: number, limit: number = 10): Promise<PaginatedStations> {
  const response = await apiClient.get<PaginatedStations>(
    '/stations/page',
    {
      params: {
        page,
        limit,
      },
    },
  );

  return response.data;
}

export async function getStation(id: number): Promise<Station> {
  const response =
    await apiClient.get<Station>(`/stations/${id}`);
  
  return response.data;
}

export async function updateStation(id: number, input: UpdateStationInput): Promise<CreatedStation> {
  const response = await apiClient.patch<CreatedStation>(`/stations/${id}`, input);
  return response.data;
}

export async function createConnector(stationId: number, input: CreateConnectorInput): Promise<Connector> {
  const response = await apiClient.post<Connector>(`/stations/${stationId}/connectors`, input);
  return response.data;
}

export async function updateConnectorOperationalStatus(id: number, operationalStatus: ConnectorOperationalStatus): Promise<Connector> {
  const response = await apiClient.patch<Connector>(`/connectors/${id}/operational-status`, { operationalStatus });
  return response.data;
}
