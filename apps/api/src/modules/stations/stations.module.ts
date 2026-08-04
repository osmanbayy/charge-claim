import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { StationsRepository } from './repositories/stations.repository';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [StationsController],
  providers: [StationsRepository, StationsService],
  exports: [StationsService],
})
export class StationsModule {}
