import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { BullMqModule } from '../../core/queue/bullmq.module';

@Module({
  imports: [PostgresDatabaseModule, BullMqModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
