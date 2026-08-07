import { apiClient } from "@/lib/api/client";
import type { CreatedStation, CreateStationInput } from "../types/station";

export async function createStation(createStatiionInput: CreateStationInput): Promise<CreatedStation> {
  const response = await apiClient.post<CreatedStation>("/stations", createStatiionInput);

  return response.data;
}