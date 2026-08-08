import { Injectable } from '@nestjs/common';
import { and, asc, eq, gt, gte, inArray, lt, notExists } from 'drizzle-orm';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import {
  connectors,
  reservations,
  stations,
  chargingSessions,
} from '../../../core/database/postgres/drizzle/schema';
import type {
  AvailableConnectorRow,
  AvailabilityFilters,
} from '../entities/availability.entity';

@Injectable()
export class AvailabilityRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  findAvailableInRange(
    startAt: Date,
    endAt: Date,
    filters: AvailabilityFilters = {},
  ): Promise<AvailableConnectorRow[]> {
    // sub query: is there a valid reservation for the connector
    const overlappingReservation = this.postgresDbService.database
      .select({
        id: reservations.id,
      })
      .from(reservations)
      .where(
        and(
          eq(reservations.connectorId, connectors.id),
          inArray(reservations.status, ['CONFIRMED', 'IN_PROGRESS']),
          lt(reservations.startAt, endAt),
          gt(reservations.endAt, startAt),
        ),
      );

    // sub query: is there an active charge session on the connector
    const overlappingActiveChargeSession = this.postgresDbService.database
      .select({
        id: chargingSessions.id,
      })
      .from(chargingSessions)
      .where(
        and(
          eq(chargingSessions.connectorId, connectors.id),
          eq(chargingSessions.status, 'ACTIVE'),
          lt(chargingSessions.startedAt, endAt),
          gt(chargingSessions.plannedEndAt, startAt),
        ),
      );

    // main query
    return this.postgresDbService.database
      .select({
        station: {
          id: stations.id,
          name: stations.name,
          district: stations.district,
          address: stations.address,
          latitude: stations.latitude,
          longitude: stations.longitude,
        },
        connector: {
          id: connectors.id,
          stationId: connectors.stationId,
          code: connectors.code,
          type: connectors.type,
          powerKw: connectors.powerKw,
          pricePerKWh: connectors.pricePerKWh,
        },
      })
      .from(connectors)
      .innerJoin(stations, eq(stations.id, connectors.stationId))
      .where(
        and(
          eq(connectors.operationalStatus, 'ACTIVE'),
          notExists(overlappingReservation),
          notExists(overlappingActiveChargeSession),

          filters.district !== undefined
            ? eq(stations.district, filters.district)
            : undefined,

          filters.connectorType !== undefined
            ? eq(connectors.type, filters.connectorType)
            : undefined,

          filters.minPowerKw !== undefined
            ? gte(connectors.powerKw, filters.minPowerKw.toString())
            : undefined,
        ),
      )
      .orderBy(asc(stations.name), asc(connectors.code));
  }
}
