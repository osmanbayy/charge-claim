import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, lte, sql } from 'drizzle-orm';
import {
  chargingSessions,
  type ChargingSessionEndReason,
} from '../../../core/database/postgres/drizzle/schema';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import type { PostgresTransaction } from '../../../core/database/postgres/postgres-transaction.type';
import type {
  ChargingSessionEntity,
  NewChargingSessionEntity,
} from '../entities/charging-session.entity';

@Injectable()
export class ChargingSessionRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  async hasActiveSessionForUser(
    transaction: PostgresTransaction,
    userId: number,
  ): Promise<boolean> {
    const [activeSession] = await transaction
      .select({ id: chargingSessions.id })
      .from(chargingSessions)
      .where(
        and(
          eq(chargingSessions.userId, userId),
          eq(chargingSessions.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    return activeSession !== undefined;
  }

  async hasActiveSessionForConnector(
    transaction: PostgresTransaction,
    connectorId: number,
  ): Promise<boolean> {
    const [activeSession] = await transaction
      .select({ id: chargingSessions.id })
      .from(chargingSessions)
      .where(
        and(
          eq(chargingSessions.connectorId, connectorId),
          eq(chargingSessions.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    return activeSession !== undefined;
  }

  async findSessionByIdAndUserIdForUpdate(
    transaction: PostgresTransaction,
    sessionId: number,
    userId: number,
  ): Promise<ChargingSessionEntity | null> {
    const [chargingSession] = await transaction
      .select()
      .from(chargingSessions)
      .where(
        and(
          eq(chargingSessions.id, sessionId),
          eq(chargingSessions.userId, userId),
        ),
      )
      .for('update')
      .limit(1);

    return chargingSession ?? null;
  }

  async createChargeSession(
    transaction: PostgresTransaction,
    newChargingSession: NewChargingSessionEntity,
  ): Promise<ChargingSessionEntity> {
    const [createdChargingSession] = await transaction
      .insert(chargingSessions)
      .values(newChargingSession)
      .returning();
    if (createdChargingSession === undefined)
      throw new Error('Charging session could not be created.');

    return createdChargingSession;
  }

  async completeChargingSession(
    transaction: PostgresTransaction,
    sessionId: number,
    endedAt: Date,
    endReason: ChargingSessionEndReason,
  ): Promise<ChargingSessionEntity | null> {
    const endedAtIso = endedAt.toISOString();
    const elapsedHoursExpression = sql`
      (
        GREATEST(
          EXTRACT(
            EPOCH FROM (
              ${endedAtIso}::timestamptz - ${chargingSessions.startedAt}
            )
          ),
          0
        ) / 3600
      )
    `;

    const energyKWhExpression = sql<string>`
      ROUND(
        (
          ${chargingSessions.powerKwSnapshot}
          * ${elapsedHoursExpression}
        )::numeric,
        3
      )
    `;

    const totalAmountExpression = sql<string>`
      ROUND(
        (
          ${energyKWhExpression}
          * ${chargingSessions.pricePerKWhSnapshot}
        )::numeric,
        2
      )
    `;

    const [completedSession] = await transaction
      .update(chargingSessions)
      .set({
        status: 'COMPLETED',
        endedAt,
        energyKWh: energyKWhExpression,
        totalAmount: totalAmountExpression,
        endReason,
        updatedAt: endedAt,
      })
      .where(
        and(
          eq(chargingSessions.id, sessionId),
          eq(chargingSessions.status, 'ACTIVE'),
        ),
      )
      .returning();

    return completedSession ?? null;
  }

  async findActiveSessionByUserId(
    userId: number,
  ): Promise<ChargingSessionEntity | null> {
    const [activeSession] = await this.postgresDbService.database
      .select()
      .from(chargingSessions)
      .where(
        and(
          eq(chargingSessions.userId, userId),
          eq(chargingSessions.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    return activeSession ?? null;
  }

  findSessionsByUserId(userId: number): Promise<ChargingSessionEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(chargingSessions)
      .where(eq(chargingSessions.userId, userId))
      .orderBy(desc(chargingSessions.startedAt));
  }

  async findSessionByIdForUpdate(
    transaction: PostgresTransaction,
    sessionId: number,
  ): Promise<ChargingSessionEntity | null> {
    const [chargingSession] = await transaction
      .select()
      .from(chargingSessions)
      .where(eq(chargingSessions.id, sessionId))
      .for('update')
      .limit(1);

    return chargingSession ?? null;
  }

  findActiveSessionsPendingCompletion(
    currentTime: Date,
    limit: number,
  ): Promise<ChargingSessionEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(chargingSessions)
      .where(
        and(
          eq(chargingSessions.status, 'ACTIVE'),
          lte(chargingSessions.plannedEndAt, currentTime),
        ),
      )
      .orderBy(asc(chargingSessions.plannedEndAt))
      .limit(limit);
  }
}
