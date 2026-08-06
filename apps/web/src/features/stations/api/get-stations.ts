import { apiClient } from "@/lib/api/client";
import type { Station } from "../types/station";

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