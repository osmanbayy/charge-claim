import { apiClient } from '@/lib/api/client';
import type {
  DashboardStatisticsParams,
  StaffDashboardLiveSnapshot,
  StaffDashboardStatistics,
} from '../types/dashboard';

export async function getStaffDashboardLive(): Promise<StaffDashboardLiveSnapshot> {
  const response = await apiClient.get<StaffDashboardLiveSnapshot>('/staff/dashboard/live');

  return response.data;
}

export async function getStaffDashboardStatistics(
  params: DashboardStatisticsParams,
): Promise<StaffDashboardStatistics> {
  const response = await apiClient.get<StaffDashboardStatistics>(
    '/staff/dashboard/statistics',
    {
      params,
    },
  );

  return response.data;
}