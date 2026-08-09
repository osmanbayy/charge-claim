import { apiClient } from "@/lib/api/client";
import type { CreatedStation, CreateStationInput, Station } from "../types/station";

export async function createStation(createStatiionInput: CreateStationInput): Promise<CreatedStation> {
  const response = await apiClient.post<CreatedStation>("/stations", createStatiionInput);

  return response.data;
}

export async function getStations(): Promise<Station[]> {
  const response =
    await apiClient.get<Station[]>("/stations");

  return response.data;
}

export async function getStation(id: number): Promise<Station> {
  const response =
    await apiClient.get<Station>(`/stations/${id}`);
  
  return response.data;
}