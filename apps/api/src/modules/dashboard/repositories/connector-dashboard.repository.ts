import { Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import {
  connectors,
  stations,
} from '../../../core/database/postgres/drizzle/schema';
import { connectorWithCurrentStatusSelection } from '../../connectors/repositories/queries/connector.queries';
import type {
  ConnectorStatusSummary,
  StationStatusSummary,
} from '../entities/dashboard.entity';

@Injectable()
export class ConnectorDashboardRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  async getStatusSummary(): Promise<ConnectorStatusSummary> {
    const connectorStatuses = this.postgresDbService.database
      .select({
        currentStatus: connectorWithCurrentStatusSelection.currentStatus,
      })
      .from(connectors)
      .as('connector_statuses');

    const countByStatus = (status?: string) => {
      if (!status) return sql<number>`COUNT(*)::integer`;
      return sql<number>`COUNT(*) FILTER (WHERE ${eq(connectorStatuses.currentStatus, status)})::integer`;
    };

    const [summary] = await this.postgresDbService.database
      .select({
        total: countByStatus(),
        available: countByStatus('AVAILABLE'),
        occupied: countByStatus('OCCUPIED'),
        reserved: countByStatus('RESERVED'),
        maintenance: countByStatus('MAINTENANCE'),
      })
      .from(connectorStatuses);

    return (
      summary ?? {
        total: 0,
        available: 0,
        occupied: 0,
        reserved: 0,
        maintenance: 0,
      }
    );
  }

  findStationStatusSummaries(): Promise<StationStatusSummary[]> {
    const connectorStatuses = this.postgresDbService.database
      .select({
        stationId: stations.id,
        stationName: stations.name,
        district: stations.district,
        currentStatus: connectorWithCurrentStatusSelection.currentStatus,
      })
      .from(stations)
      .innerJoin(connectors, eq(connectors.stationId, stations.id))
      .as('station_connector_statuses');

    return this.postgresDbService.database
      .select({
        stationId: connectorStatuses.stationId,
        stationName: connectorStatuses.stationName,
        district: connectorStatuses.district,
        total: sql<number>`COUNT(*)::integer`,
        available: sql<number>`COUNT(*) FILTER (WHERE ${connectorStatuses.currentStatus} = 'AVAILABLE')::integer`,
        occupied: sql<number>`COUNT(*) FILTER (WHERE ${connectorStatuses.currentStatus} = 'OCCUPIED')::integer`,
        reserved: sql<number>`COUNT(*) FILTER (WHERE ${connectorStatuses.currentStatus} = 'RESERVED')::integer`,
        maintenance: sql<number>`COUNT(*) FILTER (WHERE ${connectorStatuses.currentStatus} = 'MAINTENANCE')::integer`,
      })
      .from(connectorStatuses)
      .groupBy(
        connectorStatuses.stationId,
        connectorStatuses.stationName,
        connectorStatuses.district,
      )
      .orderBy(asc(connectorStatuses.stationName));
  }
}
