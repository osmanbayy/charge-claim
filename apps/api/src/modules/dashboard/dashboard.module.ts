import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './repositories/dashboard.repository';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [DashboardController],
  providers: [DashboardRepository, DashboardService],
})
export class DashboardModule {}
