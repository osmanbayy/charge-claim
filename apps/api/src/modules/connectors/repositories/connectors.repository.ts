import { Injectable } from '@nestjs/common';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import type {
  ConnectorEntity,
  ConnectorWithCurrentStatus,
  NewConnectorEntity,
  UpdateConnectorEntity,
} from '../entities/connector.entity';
import { connectors } from '../../../core/database/postgres/drizzle/schema';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { connectorWithCurrentStatusSelection } from './queries/connector.queries';

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
}
