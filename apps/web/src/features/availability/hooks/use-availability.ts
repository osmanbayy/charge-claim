import { useQuery } from "@tanstack/react-query";
import type { AvailabilityQueryParams } from "../types/availability";
import { getAvailability } from "../api";

export const availabilityQueryKeys = {
  all: ['availability'] as const,
  byParams: (params: AvailabilityQueryParams | null) =>
    [...availabilityQueryKeys.all, params] as const,
};

export function useAvailability(params: AvailabilityQueryParams | null) {
  return useQuery({
    queryKey: availabilityQueryKeys.byParams(params),
    queryFn: () => {
      if (params === null)
        throw new Error('Availability parameters are required.');

      return getAvailability(params);
    },
    enabled: params !== null,
  })
}