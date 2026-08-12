import { useQuery } from "@tanstack/react-query";
import { chargingSessionKeys } from "./use-charging-sessions";
import { getActiveChargingSession } from "../api";

export function useActiveChargingSession(enabled: boolean) {
  return useQuery({
    queryKey: chargingSessionKeys.active(),
    queryFn: getActiveChargingSession,
    enabled,
    refetchInterval: 30_000,
  })
}