import { useQuery } from "@tanstack/react-query";
import { getReservations } from "../api";

export const reservationQueryKeys = {
  all: ['reservations'] as const,
  list: () => [...reservationQueryKeys.all, 'list'] as const,
};

export function useReservations(enabled: boolean) {
  return useQuery({
    queryKey: reservationQueryKeys.list(),
    queryFn: getReservations,
    enabled,
  })
}