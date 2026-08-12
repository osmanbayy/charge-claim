import { useQuery } from '@tanstack/react-query';
import { getStaffDashboardStatistics } from '../api';
import type { DashboardStatisticsParams } from '../types/dashboard';
import { dashboardQueryKeys } from './use-staff-dashboard-live';

export function useStaffDashboardStatistics(
  params: DashboardStatisticsParams,
  enabled = true,
) {
  return useQuery({
    queryKey:
      dashboardQueryKeys.statistics(params),

    queryFn: () =>
      getStaffDashboardStatistics(params),

    enabled,
  });
}