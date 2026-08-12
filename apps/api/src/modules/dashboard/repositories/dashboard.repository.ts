import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, gt, gte, lt, sql } from 'drizzle-orm';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import {
  chargingSessions,
  connectors,
  reservations,
  stations,
} from '../../../core/database/postgres/drizzle/schema';
import { connectorWithCurrentStatusSelection } from '../../connectors/repositories/queries/connector.queries';
import type {
  ChargingSessionStatistics,
  ConnectorStatusSummary,
  DashboardStatisticsFilters,
  ReservationStatistics,
  StationStatusSummary,
} from '../entities/dashboard.entity';
import type { ChargingSessionEntity } from '../../charging-sessions/entities/charging-session.entity';
import type { ReservationEntity } from '../../reservations/entities/reservation.entity';

@Injectable()
export class DashboardRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  async getConnectorStatusSummary(): Promise<ConnectorStatusSummary> {
    const connectorStatuses = this.postgresDbService.database
      .select({
        currentStatus: connectorWithCurrentStatusSelection.currentStatus,
      })
      .from(connectors)
      .as('connector_statuses');

    const [summary] = await this.postgresDbService.database
      .select({
        total: sql<number>`
            COUNT(*)::integer
          `,
        available: sql<number>`
            COUNT(*) FILTER (
              WHERE ${connectorStatuses.currentStatus} = 'AVAILABLE'
            )::integer
          `,
        occupied: sql<number>`
            COUNT(*) FILTER (
              WHERE ${connectorStatuses.currentStatus} = 'OCCUPIED'
            )::integer
          `,
        reserved: sql<number>`
            COUNT(*) FILTER (
              WHERE ${connectorStatuses.currentStatus} = 'RESERVED'
            )::integer
          `,
        maintenance: sql<number>`
            COUNT(*) FILTER (
              WHERE ${connectorStatuses.currentStatus} = 'MAINTENANCE'
            )::integer
          `,
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

  findActiveSessions(limit: number): Promise<ChargingSessionEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(chargingSessions)
      .where(eq(chargingSessions.status, 'ACTIVE'))
      .orderBy(desc(chargingSessions.startedAt))
      .limit(limit);
  }

  findUpcomingReservations(
    currentTime: Date,
    limit: number,
  ): Promise<ReservationEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.status, 'CONFIRMED'),
          gt(reservations.startAt, currentTime),
        ),
      )
      .orderBy(asc(reservations.startAt))
      .limit(limit);
  }

  async getReservationStatistics(
    filters: DashboardStatisticsFilters,
  ): Promise<ReservationStatistics> {
    const conditions = [
      gte(reservations.startAt, filters.startAt),
      lt(reservations.startAt, filters.endAt),
    ];

    if (filters.stationId !== undefined)
      conditions.push(eq(connectors.stationId, filters.stationId));

    if (filters.district !== undefined)
      conditions.push(eq(stations.district, filters.district));

    const [statistics] = await this.postgresDbService.database
      .select({
        totalReservationCount: sql<number>`
            COUNT(*)::integer
          `,

        completedReservationCount: sql<number>`
            COUNT(*) FILTER (
              WHERE ${reservations.status} = 'COMPLETED'
            )::integer
          `,

        cancelledReservationCount: sql<number>`
            COUNT(*) FILTER (
              WHERE ${reservations.status} = 'CANCELLED'
            )::integer
          `,

        noShowReservationCount: sql<number>`
            COUNT(*) FILTER (
              WHERE ${reservations.status} = 'NO_SHOW'
            )::integer
          `,

        noShowRate: sql<string>`
            COALESCE(
              ROUND(
                (
                  COUNT(*) FILTER (
                    WHERE ${reservations.status} = 'NO_SHOW'
                  )
                )::numeric
                /
                NULLIF(
                  (
                    COUNT(*) FILTER (
                      WHERE ${reservations.status} = 'NO_SHOW'
                    )
                    +
                    COUNT(*) FILTER (
                      WHERE ${reservations.status} = 'COMPLETED'
                    )
                  ),
                  0
                )
                * 100,
                2
              ),
              0
            )::text
          `,
      })
      .from(reservations)
      .innerJoin(connectors, eq(connectors.id, reservations.connectorId))
      .innerJoin(stations, eq(stations.id, connectors.stationId))
      .where(and(...conditions));

    return (
      statistics ?? {
        totalReservationCount: 0,
        completedReservationCount: 0,
        cancelledReservationCount: 0,
        noShowReservationCount: 0,
        noShowRate: '0.00',
      }
    );
  }

  async getChargingSessionStatistics(
    filters: DashboardStatisticsFilters,
  ): Promise<ChargingSessionStatistics> {
    const conditions = [
      eq(chargingSessions.status, 'COMPLETED'),
      gte(chargingSessions.endedAt, filters.startAt),
      lt(chargingSessions.endedAt, filters.endAt),
    ];

    if (filters.stationId !== undefined) {
      conditions.push(eq(connectors.stationId, filters.stationId));
    }

    if (filters.district !== undefined) {
      conditions.push(eq(stations.district, filters.district));
    }

    const [statistics] = await this.postgresDbService.database
      .select({
        completedSessionCount: sql<number>`
            COUNT(*)::integer
          `,

        totalEnergyKWh: sql<string>`
            COALESCE(
              SUM(${chargingSessions.energyKWh}),
              0
            )::text
          `,

        totalRevenue: sql<string>`
            COALESCE(
              SUM(${chargingSessions.totalAmount}),
              0
            )::text
          `,
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

        total: sql<number>`
          COUNT(*)::integer
        `,

        available: sql<number>`
          COUNT(*) FILTER (
            WHERE ${connectorStatuses.currentStatus} = 'AVAILABLE'
          )::integer
        `,

        occupied: sql<number>`
          COUNT(*) FILTER (
            WHERE ${connectorStatuses.currentStatus} = 'OCCUPIED'
          )::integer
        `,

        reserved: sql<number>`
          COUNT(*) FILTER (
            WHERE ${connectorStatuses.currentStatus} = 'RESERVED'
          )::integer
        `,

        maintenance: sql<number>`
          COUNT(*) FILTER (
            WHERE ${connectorStatuses.currentStatus} = 'MAINTENANCE'
          )::integer
        `,
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
