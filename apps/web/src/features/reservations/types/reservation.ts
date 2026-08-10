import { ReservationDurationMinutes, ReservationStatus } from '../../../lib/constants'

export interface CreateReservationInput {
  connectorId: number;
  startAt: string;
  durationMinutes: ReservationDurationMinutes;
}

export interface Reservation {
  id: number;
  userId: number;
  connectorId: number;
  startAt: string;
  endAt: string;
  noShowDeadlineAt: string;
  status: ReservationStatus;
  cancelledAt: string | null;
  noShowEmailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}