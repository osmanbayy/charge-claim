import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, gt, inArray, lt, lte } from 'drizzle-orm';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import type { PostgresTransaction } from '../../../core/database/postgres/postgres-transaction.type';
import {
  connectors,
  reservations,
  chargingSessions,
} from '../../../core/database/postgres/drizzle/schema';
import type { ConnectorEntity } from '../../connectors/entities/connector.entity';
import type {
  NewReservationEntity,
  ReservationEntity,
} from '../entities/reservation.entity';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  // lock the connector row
  async findConnectorByIdForUpdate(
    transaction: PostgresTransaction,
    connectorId: number,
  ): Promise<ConnectorEntity | null> {
    const [connector] = await transaction
      .select()
      .from(connectors)
      .where(eq(connectors.id, connectorId))
      .for('update')
      .limit(1);

    return connector ?? null;
  }

  async hasOverlappingReservation(
    transaction: PostgresTransaction,
    connectorId: number,
    startAt: Date,
    endAt: Date,
  ): Promise<boolean> {
    const [overlappingReservation] = await transaction
      .select({ id: reservations.id })
      .from(reservations)
      .where(
        and(
          eq(reservations.connectorId, connectorId),
          inArray(reservations.status, ['CONFIRMED', 'IN_PROGRESS']),
          lt(reservations.startAt, endAt),
          gt(reservations.endAt, startAt),
        ),
      )
      .limit(1);

    return overlappingReservation !== undefined;
  }

  async hasOverlappingActiveChargeSession(
    transaction: PostgresTransaction,
    connectorId: number,
    startAt: Date,
    endAt: Date,
  ): Promise<boolean> {
    const [overlappingActiveChargeSession] = await transaction
      .select({ id: chargingSessions.id })
      .from(chargingSessions)
      .where(
        and(
          eq(chargingSessions.connectorId, connectorId),
          eq(chargingSessions.status, 'ACTIVE'),
          lt(chargingSessions.startedAt, endAt),
          gt(chargingSessions.plannedEndAt, startAt),
        ),
      )
      .limit(1);

    return overlappingActiveChargeSession !== undefined;
  }

  async createReservation(
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

  // Find all reservations of the authenticated user
  findReservationsByUserId(userId: number): Promise<ReservationEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(reservations)
      .where(eq(reservations.userId, userId))
      .orderBy(desc(reservations.startAt));
  }

  // Find only one reservation of the authenticated user
  async findReservationByIdAndUserId(
    userId: number,
    reservationId: number,
  ): Promise<ReservationEntity | null> {
    const [reservation] = await this.postgresDbService.database
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.userId, userId),
        ),
      )
      .limit(1);

    return reservation ?? null;
  }

  // lock the reservation row
  // Kullanıcı iptal ediyor
  // Worker NO_SHOW yapmak istiyor
  // Kullanıcı şarjı başlatıyor
  // Kilit olmazsa üç işlem de aynı anda status = CONFIRMED değerini okuyabilir.
  // o yüzden connector satırı yerine rezervasyon satırını kilitleyeceğiz.
  async findReservationByIdAnUserIdForUpdate(
    transaction: PostgresTransaction,
    reservationId: number,
    userId: number,
  ): Promise<ReservationEntity | null> {
    const [reservation] = await transaction
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.userId, userId),
        ),
      )
      .for('update')
      .limit(1);

    return reservation ?? null;
  }

  // lock reservation row for worker -> (there is no ownership control)
  async findReservationByIdForUpdate(
    transaction: PostgresTransaction,
    reservationId: number,
  ): Promise<ReservationEntity | null> {
    const [reservation] = await transaction
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .for('update')
      .limit(1);

    return reservation ?? null;
  }

  // cancel reservation
  async cancelReservation(
    transaction: PostgresTransaction,
    reservationId: number,
    cancelledAt: Date,
  ): Promise<ReservationEntity | null> {
    const [cancelledReservation] = await transaction
      .update(reservations)
      .set({
        status: 'CANCELLED',
        cancelledAt,
        updatedAt: cancelledAt,
      })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, 'CONFIRMED'),
        ),
      )
      .returning();

    return cancelledReservation ?? null;
  }

  async markReservationAsNoShow(
    transaction: PostgresTransaction,
    reservationId: number,
    processedAt: Date,
  ): Promise<ReservationEntity | null> {
    const [noShowReservation] = await transaction
      .update(reservations)
      .set({
        status: 'NO_SHOW',
        updatedAt: processedAt,
      })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, 'CONFIRMED'),
          lte(reservations.noShowDeadlineAt, processedAt),
        ),
      )
      .returning();

    return noShowReservation ?? null;
  }

  // find reservartions taht were no-show but remain confimed (recovery scan)
  findExpiredConfirmedReservations(
    currentTime: Date,
    limit: number,
  ): Promise<ReservationEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.status, 'CONFIRMED'),
          lte(reservations.noShowDeadlineAt, currentTime),
        ),
      )
      .orderBy(asc(reservations.noShowDeadlineAt))
      .limit(limit);
  }
}
