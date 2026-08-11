import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RESERVATION_NO_SHOW_QUEUE } from './common/queues/reservation-no-show.queue';
import { AppConfigModule } from './core/config/app-config.module';
import { PostgresDatabaseModule } from './core/database/postgres/postgres-database.module';
import { BullMqModule } from './core/queue/bullmq.module';
import { ReservationsRepository } from './modules/reservations/repositories/reservations.repository';
import { ReservationNoShowProcessor } from './worker/reservation-no-show.processor';
import { ReservationNoShowQueueService } from './modules/reservations/queues/reservation-no-show-queue.service';
import { ReservationNoShowRecoveryService } from './worker/services/reservation-no-show-recovery.service';
import { MailModule } from './core/mail/mail.module';

@Module({
  imports: [
    AppConfigModule,
    PostgresDatabaseModule,
    BullMqModule,
    MailModule,

    BullModule.registerQueue({
      name: RESERVATION_NO_SHOW_QUEUE,
    }),
  ],
  providers: [
    ReservationsRepository,
    ReservationNoShowProcessor,
    ReservationNoShowQueueService,
    ReservationNoShowRecoveryService,
  ],
})
export class WorkerModule {}
