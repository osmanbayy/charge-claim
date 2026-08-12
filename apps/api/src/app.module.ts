import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/app-config.module';
import { PostgresDatabaseModule } from './core/database/postgres/postgres-database.module';
import { AuthModule } from './modules/auth/auth.module';
import { StationsModule } from './modules/stations/stations.module';
import { ConnectorsModule } from './modules/connectors/connectors.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { BullMqModule } from './core/queue/bullmq.module';
import { ChargingSessionsModule } from './modules/charging-sessions/charging-session.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    AppConfigModule,
    PostgresDatabaseModule,
    AuthModule,
    StationsModule,
    ConnectorsModule,
    AvailabilityModule,
    ReservationsModule,
    BullMqModule,
    ChargingSessionsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
