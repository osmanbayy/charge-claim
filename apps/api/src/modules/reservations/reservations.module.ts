import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../core/config/app-config.module';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { AuthModule } from '../auth/auth.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsRepository } from './repositories/reservations.repository';
import { ReservationsService } from './reservations.service';
import { BullModule } from '@nestjs/bullmq';
import { RESERVATION_NO_SHOW_QUEUE } from '../../common/queues/reservation-no-show.queue';
import { ReservationNoShowQueueService } from './queues/reservation-no-show-queue.service';

@Module({
  imports: [
    AppConfigModule,
    PostgresDatabaseModule,
    AuthModule,

    BullModule.registerQueue({ name: RESERVATION_NO_SHOW_QUEUE }),
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsRepository,
    ReservationsService,
    ReservationNoShowQueueService,
  ],
})
export class ReservationsModule {}
