import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { ConnectorsController } from './connectors.controller';
import { ConnectorsRepository } from './repositories/connectors.repository';
import { ConnectorsService } from './connectors.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PostgresDatabaseModule, AuthModule],
  controllers: [ConnectorsController],
  providers: [ConnectorsRepository, ConnectorsService],
  exports: [ConnectorsService],
})
export class ConnectorsModule {}
