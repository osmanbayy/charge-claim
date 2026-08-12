import { useQuery } from '@tanstack/react-query';
import { getStaffDashboardLive } from '../api';
import type { DashboardStatisticsParams } from '../types/dashboard';

export const dashboardQueryKeys = {
  all: ['staff-dashboard'] as const,

  live: () => [...dashboardQueryKeys.all, 'live'] as const,

  statistics: (params: DashboardStatisticsParams) =>
    [
      ...dashboardQueryKeys.all,
      'statistics',
      params,
    ] as const,
};

export function useStaffDashboardLive(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.live(),
    queryFn: getStaffDashboardLive,
    enabled,
    refetchInterval: 10_000,
  });
}