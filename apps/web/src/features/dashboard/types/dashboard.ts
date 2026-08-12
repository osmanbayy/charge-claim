import type { ChargingSession } from '@/features/charge-sessions/types/charging-session';
import type { Reservation } from '@/features/reservations/types/reservation';

export interface ConnectorStatusSummary {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
}

export interface StationStatusSummary
  extends ConnectorStatusSummary {
  stationId: number;
  stationName: string;
  district: string;
}

export interface StaffDashboardLiveSnapshot {
  connectorSummary: ConnectorStatusSummary;
  stationSummaries: StationStatusSummary[];
  activeSessions: ChargingSession[];
  upcomingReservations: Reservation[];
}

export interface DashboardStatisticsParams {
  startAt: string;
  endAt: string;
  stationId?: number;
  district?: string;
}

export interface StaffDashboardStatistics {
  totalReservationCount: number;
  completedReservationCount: number;
  cancelledReservationCount: number;
  noShowReservationCount: number;
  noShowRate: string;
  completedSessionCount: number;
  totalEnergyKWh: string;
  totalRevenue: string;
}