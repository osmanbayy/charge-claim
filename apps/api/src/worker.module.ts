import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RESERVATION_NO_SHOW_QUEUE } from './common/queues/reservation-no-show.queue';
import { AppConfigModule } from './core/config/app-config.module';
import { PostgresDatabaseModule } from './core/database/postgres/postgres-database.module';
import { BullMqModule } from './core/queue/bullmq.module';
import { ReservationQueryRepository } from './modules/reservations/repositories/reservation-query.repository';
import { ReservationCommandRepository } from './modules/reservations/repositories/reservation-command.repository';
import { NoShowNotificationRepository } from './modules/reservations/repositories/no-show-notification.repository';
import { ReservationNoShowProcessor } from './worker/reservation-no-show.processor';
import { ReservationNoShowQueueService } from './modules/reservations/queues/reservation-no-show-queue.service';
import { ReservationNoShowRecoveryService } from './worker/services/reservation-no-show-recovery.service';
import { MailModule } from './core/mail/mail.module';
import { CHARGING_SESSION_COMPLETION_QUEUE } from './common/queues/charging-session-completion.queue';
import { ChargingSessionRepository } from './modules/charging-sessions/repositories/charging-sessions.repository';
import { ChargingSessionCompletionProcessor } from './worker/charging-session-completion.processor';
import { ChargingSessionCompletionQueueService } from './modules/charging-sessions/charging-session-completion-queue.service';
import { ChargingSessionCompletionRecoveryService } from './worker/services/charging-session-completion-recovery.service';

@Module({
  imports: [
    AppConfigModule,
    PostgresDatabaseModule,
    BullMqModule,
    MailModule,

    BullModule.registerQueue({
      name: RESERVATION_NO_SHOW_QUEUE,
    }),
    BullModule.registerQueue({
      name: CHARGING_SESSION_COMPLETION_QUEUE,
    }),
  ],
  providers: [
    ReservationQueryRepository,
    ReservationCommandRepository,
    NoShowNotificationRepository,
    ChargingSessionRepository,
    ReservationNoShowProcessor,
    ChargingSessionCompletionProcessor,
    ReservationNoShowQueueService,
    ChargingSessionCompletionQueueService,
    ReservationNoShowRecoveryService,
    ChargingSessionCompletionRecoveryService,
  ],
})
export class WorkerModule {}
