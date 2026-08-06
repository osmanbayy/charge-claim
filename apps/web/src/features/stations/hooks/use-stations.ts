import { useQuery } from "@tanstack/react-query";
import { getStation, getStations } from "../api/get-stations";

export const stationQueryKeys = {
  all: ["stations"] as const,
  detail: (id: number) => ["stations", id] as const,
};

export function useStations() {
  return useQuery({
    queryKey: stationQueryKeys.all,
    queryFn: getStations,
    refetchInterval: 15_000,
  });
}

export function useStation(id: number) {
  return useQuery({
    queryKey: stationQueryKeys.detail(id),
    queryFn: () => getStation(id),
    refetchInterval: 15_000,
  });
}