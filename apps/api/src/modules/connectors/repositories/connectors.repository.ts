import { Injectable } from '@nestjs/common';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import type { ConnectorWithCurrentStatus } from '../entities/connector.entity';
import { connectors } from '../../../core/database/postgres/drizzle/schema';
import { asc, eq, inArray } from 'drizzle-orm';
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
}
