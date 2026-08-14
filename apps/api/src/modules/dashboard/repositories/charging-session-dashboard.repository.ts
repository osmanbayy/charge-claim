import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import {
  chargingSessions,
  connectors,
  stations,
} from '../../../core/database/postgres/drizzle/schema';
import type { ChargingSessionEntity } from '../../charging-sessions/entities/charging-session.entity';
import type {
  ChargingSessionStatistics,
  DashboardStatisticsFilters,
} from '../entities/dashboard.entity';

@Injectable()
export class ChargingSessionDashboardRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  findActive(limit: number): Promise<ChargingSessionEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(chargingSessions)
      .where(eq(chargingSessions.status, 'ACTIVE'))
      .orderBy(desc(chargingSessions.startedAt))
      .limit(limit);
  }

  async getStatistics(
    filters: DashboardStatisticsFilters,
  ): Promise<ChargingSessionStatistics> {
    const conditions = [
      eq(chargingSessions.status, 'COMPLETED'),
      gte(chargingSessions.endedAt, filters.startAt),
      lt(chargingSessions.endedAt, filters.endAt),
    ];

    if (filters.stationId !== undefined)
      conditions.push(eq(connectors.stationId, filters.stationId));
    if (filters.district !== undefined)
      conditions.push(eq(stations.district, filters.district));

    const [statistics] = await this.postgresDbService.database
      .select({
        completedSessionCount: sql<number>`COUNT(*)::integer`,
        totalEnergyKWh: sql<string>`COALESCE(SUM(${chargingSessions.energyKWh}), 0)::text`,
        totalRevenue: sql<string>`COALESCE(SUM(${chargingSessions.totalAmount}), 0)::text`,
      })
      .from(chargingSessions)
      .innerJoin(connectors, eq(connectors.id, chargingSessions.connectorId))
      .innerJoin(stations, eq(stations.id, connectors.stationId))
      .where(and(...conditions));

    return (
      statistics ?? {
        completedSessionCount: 0,
        totalEnergyKWh: '0.000',
        totalRevenue: '0.00',
      }
    );
  }
}
