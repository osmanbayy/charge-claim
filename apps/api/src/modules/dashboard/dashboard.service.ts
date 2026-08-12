import { Injectable, BadRequestException } from '@nestjs/common';
import { DashboardRepository } from './repositories/dashboard.repository';
import type {
  DashboardStatisticsFilters,
  StaffDashboardLiveSnapshot,
  StaffDashboardStatistics,
} from './entities/dashboard.entity';
import type { DashboardStatisticsQueryDto } from './dto/dashboard-statistics-query.dto';

const LIVE_LIST_LIMIT = 10;

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getLiveSnapshot(): Promise<StaffDashboardLiveSnapshot> {
    const currentTime = new Date();

    const [
      connectorSummary,
      stationSummaries,
      activeSessions,
      upcomingReservations,
    ] = await Promise.all([
      this.dashboardRepository.getConnectorStatusSummary(),
      this.dashboardRepository.findStationStatusSummaries(),
      this.dashboardRepository.findActiveSessions(LIVE_LIST_LIMIT),
      this.dashboardRepository.findUpcomingReservations(
        currentTime,
        LIVE_LIST_LIMIT,
      ),
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
        this.dashboardRepository.getReservationStatistics(filters),
        this.dashboardRepository.getChargingSessionStatistics(filters),
      ]);

    return {
      ...reservationStatistics,
      ...chargingSessionStatistics,
    };
  }
}
