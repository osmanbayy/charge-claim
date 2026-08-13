import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { RESERVATION_NO_SHOW_QUEUE } from '../../common/queues/reservation-no-show.queue';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [
    PostgresDatabaseModule,

    BullModule.registerQueue({
      name: RESERVATION_NO_SHOW_QUEUE,
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
