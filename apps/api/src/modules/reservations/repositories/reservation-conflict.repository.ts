import { Injectable } from '@nestjs/common';
import { and, eq, gt, inArray, lt } from 'drizzle-orm';
import type { PostgresTransaction } from '../../../core/database/postgres/postgres-transaction.type';
import {
  chargingSessions,
  connectors,
  reservations,
} from '../../../core/database/postgres/drizzle/schema';
import type { ConnectorEntity } from '../../connectors/entities/connector.entity';

@Injectable()
export class ReservationConflictRepository {
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
    const [overlap] = await transaction
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

    return overlap !== undefined;
  }

  async hasOverlappingActiveChargingSession(
    transaction: PostgresTransaction,
    connectorId: number,
    startAt: Date,
    endAt: Date,
  ): Promise<boolean> {
    const [overlap] = await transaction
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

    return overlap !== undefined;
  }
}
