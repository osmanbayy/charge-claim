import type { ReservationDurationMinutes } from '@/lib/constants';

export type ChargingSessionStatus =
  | 'ACTIVE'
  | 'COMPLETED';

export type ChargingSessionEndReason =
  | 'USER_STOPPED'
  | 'TIME_LIMIT_REACHED';

export interface ChargingSession {
  id: number;
  userId: number;
  connectorId: number;
  reservationId: number | null;
  status: ChargingSessionStatus;
  startedAt: string;
  plannedEndAt: string;
  endedAt: string | null;
  powerKwSnapshot: string;
  pricePerKWhSnapshot: string;
  energyKWh: string | null;
  totalAmount: string | null;
  endReason: ChargingSessionEndReason | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartChargingFromReservationInput {
  reservationId: number;
}

export interface StartWalkInChargingInput {
  connectorId: number;
  durationMinutes: ReservationDurationMinutes;
}