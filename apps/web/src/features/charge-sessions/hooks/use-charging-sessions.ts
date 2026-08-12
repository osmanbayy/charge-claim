import { useQuery } from '@tanstack/react-query';
import { getChargingSessions } from '../api';

export const chargingSessionKeys = {
  all: ['charging-sessions'] as const,
  lists: () => [...chargingSessionKeys.all, 'list'] as const,
  active: () => [...chargingSessionKeys.all, 'active'] as const,
};

export function useChargingSessions(enabled = true) {
  return useQuery({
    queryKey: chargingSessionKeys.lists(),
    queryFn: getChargingSessions,
    enabled,
  });
}