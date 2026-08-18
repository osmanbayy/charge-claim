import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { ChargingSessionRepository } from './repositories/charging-sessions.repository';
import { ChargingSessionsService } from './charging-session.service';
import { ChargingSessionsController } from './charging-session.controller';
import { ChargingSessionCompletionQueueService } from './charging-session-completion-queue.service';
import { BullMqModule } from '../../core/queue/bullmq.module';

@Module({
  imports: [PostgresDatabaseModule, ReservationsModule, BullMqModule],
  controllers: [ChargingSessionsController],
  providers: [
    ChargingSessionRepository,
    ChargingSessionsService,
    ChargingSessionCompletionQueueService,
  ],
  exports: [ChargingSessionRepository, ChargingSessionCompletionQueueService],
})
export class ChargingSessionsModule {}
