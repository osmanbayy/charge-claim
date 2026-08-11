import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { chargingSessions } from '../../../core/database/postgres/drizzle/schema';
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
}
