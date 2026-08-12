import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { ChargingSessionRepository } from './repositories/charging-sessions.repository';
import { ChargingSessionsService } from './charging-session.service';
import { ChargingSessionsController } from './charging-session.controller';
import { BullModule } from '@nestjs/bullmq';
import { CHARGING_SESSION_COMPLETION_QUEUE } from '../../common/queues/charging-session-completion.queue';
import { ChargingSessionCompletionQueueService } from './charging-session-completion-queue.service';

@Module({
  imports: [
    PostgresDatabaseModule,
    ReservationsModule,

    BullModule.registerQueue({
      name: CHARGING_SESSION_COMPLETION_QUEUE,
    }),
  ],
  controllers: [ChargingSessionsController],
  providers: [
    ChargingSessionRepository,
    ChargingSessionsService,
    ChargingSessionCompletionQueueService,
  ],
})
export class ChargingSessionsModule {}
