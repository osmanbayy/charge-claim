import type { ChargingSessionEntity } from '../../charging-sessions/entities/charging-session.entity';
import type { ReservationEntity } from '../../reservations/entities/reservation.entity';

export interface ConnectorStatusSummary {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
}

export interface StaffDashboardLiveSnapshot {
  connectorSummary: ConnectorStatusSummary;
  stationSummaries: StationStatusSummary[];
  activeSessions: ChargingSessionEntity[];
  upcomingReservations: ReservationEntity[];
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

export interface DashboardStatisticsFilters {
  startAt: Date;
  endAt: Date;
  stationId?: number;
  district?: string;
}

export interface ReservationStatistics {
  totalReservationCount: number;
  completedReservationCount: number;
  cancelledReservationCount: number;
  noShowReservationCount: number;
  noShowRate: string;
}

export interface ChargingSessionStatistics {
  completedSessionCount: number;
  totalEnergyKWh: string;
  totalRevenue: string;
}

export interface StationStatusSummary extends ConnectorStatusSummary {
  stationId: number;
  stationName: string;
  district: string;
}
