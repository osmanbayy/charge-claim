import { useQuery } from "@tanstack/react-query";
import { getStation, getStations, getStationPage } from "../api";

export const stationQueryKeys = {
  all: ["stations"] as const,

  page: (page: number, limit: number) =>
  [...stationQueryKeys.all, 'page', page, limit] as const,

  detail: (id: number) => ["stations", id] as const,
};

export function useStations(enabled = true) {
  return useQuery({
    queryKey: stationQueryKeys.all,
    queryFn: getStations,
    enabled,
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

export function useStationPage(
  page: number,
  limit: number = 10,
  enabled = true,
) {
  return useQuery({
    queryKey: stationQueryKeys.page(page, limit),
    queryFn: () => getStationPage(page, limit),

    placeholderData: (prevData) => prevData,
    enabled,
    refetchInterval: 15_000,
  });
}