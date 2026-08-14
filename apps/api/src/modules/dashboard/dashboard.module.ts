import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ConnectorDashboardRepository } from './repositories/connector-dashboard.repository';
import { ReservationDashboardRepository } from './repositories/reservation-dashboard.repository';
import { ChargingSessionDashboardRepository } from './repositories/charging-session-dashboard.repository';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [DashboardController],
  providers: [
    ConnectorDashboardRepository,
    ReservationDashboardRepository,
    ChargingSessionDashboardRepository,
    DashboardService,
  ],
})
export class DashboardModule {}
