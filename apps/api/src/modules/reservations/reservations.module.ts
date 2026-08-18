import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../core/config/app-config.module';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { AuthModule } from '../auth/auth.module';
import { ReservationsController } from './reservations.controller';
import { ReservationQueryRepository } from './repositories/reservation-query.repository';
import { ReservationCommandRepository } from './repositories/reservation-command.repository';
import { ReservationConflictRepository } from './repositories/reservation-conflict.repository';
import { NoShowNotificationRepository } from './repositories/no-show-notification.repository';
import { ReservationsService } from './reservations.service';
import { ReservationNoShowQueueService } from './queues/reservation-no-show-queue.service';
import { BullMqModule } from '../../core/queue/bullmq.module';

@Module({
  imports: [AppConfigModule, PostgresDatabaseModule, AuthModule, BullMqModule],
  controllers: [ReservationsController],
  providers: [
    ReservationQueryRepository,
    ReservationCommandRepository,
    ReservationConflictRepository,
    NoShowNotificationRepository,
    ReservationsService,
    ReservationNoShowQueueService,
  ],
  exports: [
    ReservationQueryRepository,
    ReservationCommandRepository,
    ReservationConflictRepository,
    NoShowNotificationRepository,
    ReservationNoShowQueueService,
  ],
})
export class ReservationsModule {}
