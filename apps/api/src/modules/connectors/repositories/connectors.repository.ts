import { Injectable } from '@nestjs/common';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import type {
  ConnectorEntity,
  ConnectorWithCurrentStatus,
  NewConnectorEntity,
  UpdateConnectorEntity,
} from '../entities/connector.entity';
import {
  chargingSessions,
  type ConnectorOperationalStatus,
  connectors,
  reservations,
} from '../../../core/database/postgres/drizzle/schema';
import { and, asc, eq, gt, inArray } from 'drizzle-orm';
import { connectorWithCurrentStatusSelection } from './queries/connector.queries';
import { PostgresTransaction } from '../../../core/database/postgres/postgres-transaction.type';

@Injectable()
export class ConnectorsRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  async findById(id: number): Promise<ConnectorWithCurrentStatus | null> {
    const [connector] = await this.postgresDbService.database
      .select(connectorWithCurrentStatusSelection)
      .from(connectors)
      .where(eq(connectors.id, id))
      .limit(1);

    return connector ?? null;
  }

  async findByStationIds(
    stationIds: number[],
  ): Promise<ConnectorWithCurrentStatus[]> {
    if (stationIds.length === 0) return [];

    return this.postgresDbService.database
      .select(connectorWithCurrentStatusSelection)
      .from(connectors)
      .where(inArray(connectors.stationId, stationIds))
      .orderBy(asc(connectors.stationId), asc(connectors.code));
  }

  async findByStationIdAndCode(
    stationId: number,
    code: string,
  ): Promise<ConnectorEntity | null> {
    const [connector] = await this.postgresDbService.database
      .select()
      .from(connectors)
      .where(
        and(eq(connectors.stationId, stationId), eq(connectors.code, code)),
      )
      .limit(1);

    return connector ?? null;
  }

  async create(newConnector: NewConnectorEntity): Promise<ConnectorEntity> {
    const [createdConnector] = await this.postgresDbService.database
      .insert(connectors)
      .values(newConnector)
      .returning();
    if (!createdConnector) throw new Error('Connector could not be created.');

    return createdConnector;
  }

  async update(
    id: number,
    changes: UpdateConnectorEntity,
  ): Promise<ConnectorEntity | null> {
    const [updatedConnector] = await this.postgresDbService.database
      .update(connectors)
      .set({
        ...changes,
        updatedAt: new Date(),
      })
      .where(eq(connectors.id, id))
      .returning();

    return updatedConnector ?? null;
  }

  // find connector id for lock the row (FOR UPDATE)
  async findByIdForUpdate(
    transaction: PostgresTransaction,
    id: number,
  ): Promise<ConnectorEntity | null> {
    const [connector] = await this.postgresDbService.database
      .select()
      .from(connectors)
      .where(eq(connectors.id, id))
      // lock for connector row
      .for('update')
      .limit(1);

    return connector ?? null;
  }

  // is there active charging in the connector?
  async hasActiveChargingSession(
    transaction: PostgresTransaction,
    connectorId: number,
  ): Promise<boolean> {
    const [activeSession] = await transaction
      .select({
        id: chargingSessions.id,
      })
      .from(chargingSessions)
      // only get status is active
      .where(
        and(
          eq(chargingSessions.connectorId, connectorId),
          eq(chargingSessions.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    return activeSession !== undefined;
  }

  // get confirmed but not yet completed or future confirmed reservatşons.
  async hasUpcomingConfirmedReservation(
    transaction: PostgresTransaction,
    connectorId: number,
    now: Date,
  ): Promise<boolean> {
    const [reservation] = await transaction
      .select({
        id: reservations.id,
      })
      .from(reservations)
      .where(
        and(
          eq(reservations.connectorId, connectorId),
          eq(reservations.status, 'CONFIRMED'),
          gt(reservations.endAt, now),
        ),
      )
      .limit(1);

    return reservation !== undefined;
  }

  async updateOperationalStatus(
    transaction: PostgresTransaction,
    connectorId: number,
    operationalStatus: ConnectorOperationalStatus,
  ): Promise<ConnectorEntity | null> {
    const [statusUpdatedConnector] = await transaction
      .update(connectors)
      .set({
        operationalStatus,
        updatedAt: new Date(),
      })
      .where(eq(connectors.id, connectorId))
      .returning();

    return statusUpdatedConnector ?? null;
  }
}
