import { Module } from '@nestjs/common';
import { PostgresDatabaseService } from './postgres-database.service';

@Module({
  providers: [PostgresDatabaseService],
  exports: [PostgresDatabaseService],
})
export class PostgresDatabaseModule {}
