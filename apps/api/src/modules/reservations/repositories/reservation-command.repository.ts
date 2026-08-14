import { Injectable } from '@nestjs/common';
import { and, eq, lte } from 'drizzle-orm';
import type { PostgresTransaction } from '../../../core/database/postgres/postgres-transaction.type';
import { reservations } from '../../../core/database/postgres/drizzle/schema';
import type {
  NewReservationEntity,
  ReservationEntity,
} from '../entities/reservation.entity';

@Injectable()
export class ReservationCommandRepository {
  async create(
    transaction: PostgresTransaction,
    newReservation: NewReservationEntity,
  ): Promise<ReservationEntity> {
    const [createdReservation] = await transaction
      .insert(reservations)
      .values(newReservation)
      .returning();

    if (createdReservation === undefined)
      throw new Error('Reservation could not be created.');

    return createdReservation;
  }

  async cancel(
    transaction: PostgresTransaction,
    reservationId: number,
    cancelledAt: Date,
  ): Promise<ReservationEntity | null> {
    const [cancelledReservation] = await transaction
      .update(reservations)
      .set({ status: 'CANCELLED', cancelledAt, updatedAt: cancelledAt })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, 'CONFIRMED'),
        ),
      )
      .returning();

    return cancelledReservation ?? null;
  }

  async markAsNoShow(
    transaction: PostgresTransaction,
    reservationId: number,
    processedAt: Date,
  ): Promise<ReservationEntity | null> {
    const [reservation] = await transaction
      .update(reservations)
      .set({ status: 'NO_SHOW', updatedAt: processedAt })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, 'CONFIRMED'),
          lte(reservations.noShowDeadlineAt, processedAt),
        ),
      )
      .returning();

    return reservation ?? null;
  }

  async markAsInProgress(
    transaction: PostgresTransaction,
    reservationId: number,
    userId: number,
    updatedAt: Date,
  ): Promise<ReservationEntity | null> {
    const [reservation] = await transaction
      .update(reservations)
      .set({ status: 'IN_PROGRESS', updatedAt })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.userId, userId),
          eq(reservations.status, 'CONFIRMED'),
        ),
      )
      .returning();

    return reservation ?? null;
  }

  async markAsCompleted(
    transaction: PostgresTransaction,
    reservationId: number,
    completedAt: Date,
  ): Promise<ReservationEntity | null> {
    const [reservation] = await transaction
      .update(reservations)
      .set({ status: 'COMPLETED', updatedAt: completedAt })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, 'IN_PROGRESS'),
        ),
      )
      .returning();

    return reservation ?? null;
  }
}
