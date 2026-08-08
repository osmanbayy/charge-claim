import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { AvailabilityController } from './availability.controller';
import { AvailabilityRepository } from './repositories/availability.repository';
import { AvailabilityService } from './availability.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityRepository, AvailabilityService],
})
export class AvailabilityModule {}
