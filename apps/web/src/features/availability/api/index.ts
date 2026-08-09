import { apiClient } from "@/lib/api/client";
import type { AvailabilityQueryParams, AvailabilityResponse } from "../types/availability";

export async function getAvailability(
  params: AvailabilityQueryParams,
): Promise<AvailabilityResponse> {
  const response = await apiClient.get<AvailabilityResponse>("/availability", {
    params,
  });

  return response.data;
}