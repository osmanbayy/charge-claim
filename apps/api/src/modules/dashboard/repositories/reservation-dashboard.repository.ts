import { Injectable } from '@nestjs/common';
import { and, asc, eq, gt, gte, lt, sql } from 'drizzle-orm';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import {
  connectors,
  reservations,
  ReservationStatus,
  stations,
} from '../../../core/database/postgres/drizzle/schema';
import type { ReservationEntity } from '../../reservations/entities/reservation.entity';
import type {
  DashboardStatisticsFilters,
  ReservationStatistics,
} from '../entities/dashboard.entity';

@Injectable()
export class ReservationDashboardRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  findUpcoming(currentTime: Date, limit: number): Promise<ReservationEntity[]> {
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

  async getStatistics(
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

    const countByStatus = (status?: ReservationStatus) => {
      if (!status) return sql<number>`COUNT(*)::integer`;
      return sql<number>`COUNT(*) FILTER (WHERE ${eq(reservations.status, status)})::integer`;
    };

    const [statistics] = await this.postgresDbService.database
      .select({
        totalReservationCount: countByStatus(),
        completedReservationCount: countByStatus('COMPLETED'),
        cancelledReservationCount: countByStatus('CANCELLED'),
        noShowReservationCount: countByStatus('NO_SHOW'),
        noShowRate: sql<string>`
          COALESCE(
            ROUND(
              (COUNT(*) FILTER (WHERE ${reservations.status} = 'NO_SHOW'))::numeric
              / NULLIF(
                COUNT(*) FILTER (WHERE ${reservations.status} = 'NO_SHOW')
                + COUNT(*) FILTER (WHERE ${reservations.status} = 'COMPLETED'),
                0
              ) * 100,
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
}
