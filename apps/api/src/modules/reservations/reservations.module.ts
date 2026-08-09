import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../core/config/app-config.module';
import { PostgresDatabaseModule } from '../../core/database/postgres/postgres-database.module';
import { AuthModule } from '../auth/auth.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsRepository } from './repositories/reservations.repository';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [AppConfigModule, PostgresDatabaseModule, AuthModule],
  controllers: [ReservationsController],
  providers: [ReservationsRepository, ReservationsService],
})
export class ReservationsModule {}
