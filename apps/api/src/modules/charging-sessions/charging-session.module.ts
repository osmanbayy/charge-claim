import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { ChargingSessionRepository } from './repositories/charging-sessions.repository';
import { ChargingSessionsService } from './charging-session.service';
import { ChargingSessionsController } from './charging-session.controller';

@Module({
  imports: [PostgresDatabaseModule, ReservationsModule],
  controllers: [ChargingSessionsController],
  providers: [ChargingSessionRepository, ChargingSessionsService],
})
export class ChargingSessionsModule {}
