import { Injectable, BadRequestException } from '@nestjs/common';
import { ConnectorDashboardRepository } from './repositories/connector-dashboard.repository';
import { ReservationDashboardRepository } from './repositories/reservation-dashboard.repository';
import { ChargingSessionDashboardRepository } from './repositories/charging-session-dashboard.repository';
import type {
  DashboardStatisticsFilters,
  StaffDashboardLiveSnapshot,
  StaffDashboardStatistics,
} from './entities/dashboard.entity';
import type { DashboardStatisticsQueryDto } from './dto/dashboard-statistics-query.dto';

const LIVE_LIST_LIMIT = 10;

@Injectable()
export class DashboardService {
  constructor(
    private readonly connectorDashboard: ConnectorDashboardRepository,
    private readonly reservationDashboard: ReservationDashboardRepository,
    private readonly chargingSessionDashboard: ChargingSessionDashboardRepository,
  ) {}

  async getLiveSnapshot(): Promise<StaffDashboardLiveSnapshot> {
    const currentTime = new Date();

    const [
      connectorSummary,
      stationSummaries,
      activeSessions,
      upcomingReservations,
    ] = await Promise.all([
      this.connectorDashboard.getStatusSummary(),
      this.connectorDashboard.findStationStatusSummaries(),
      this.chargingSessionDashboard.findActive(LIVE_LIST_LIMIT),
      this.reservationDashboard.findUpcoming(currentTime, LIVE_LIST_LIMIT),
    ]);

    return {
      connectorSummary,
      stationSummaries,
      activeSessions,
      upcomingReservations,
    };
  }

  private createStatisticsFilters(
    query: DashboardStatisticsQueryDto,
  ): DashboardStatisticsFilters {
    const startAt = new Date(query.startAt);
    const endAt = new Date(query.endAt);

    if (endAt.getTime() <= startAt.getTime())
      throw new BadRequestException({
        code: 'INVALID_STATISTICS_DATE_RANGE',
        message: 'Statistics end time must be later than start time.',
      });

    const district = query.district?.trim();

    return {
      startAt,
      endAt,
      stationId: query.stationId,
      district: district && district.length > 0 ? district : undefined,
    };
  }

  async getStatistics(
    query: DashboardStatisticsQueryDto,
  ): Promise<StaffDashboardStatistics> {
    const filters = this.createStatisticsFilters(query);

    const [reservationStatistics, chargingSessionStatistics] =
      await Promise.all([
        this.reservationDashboard.getStatistics(filters),
        this.chargingSessionDashboard.getStatistics(filters),
      ]);

    return {
      ...reservationStatistics,
      ...chargingSessionStatistics,
    };
  }
}
