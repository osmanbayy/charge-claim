import { Module } from '@nestjs/common';
import { AppConfigModule } from './core/config/app-config.module';
import { PostgresDatabaseModule } from './core/database/postgres/postgres-database.module';
import { BullMqModule } from './core/queue/bullmq.module';
import { ReservationNoShowProcessor } from './worker/reservation-no-show.processor';
import { ReservationNoShowRecoveryService } from './worker/services/reservation-no-show-recovery.service';
import { MailModule } from './core/mail/mail.module';
import { ChargingSessionCompletionProcessor } from './worker/charging-session-completion.processor';
import { ChargingSessionCompletionRecoveryService } from './worker/services/charging-session-completion-recovery.service';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ChargingSessionsModule } from './modules/charging-sessions/charging-session.module';

@Module({
  imports: [
    AppConfigModule,
    PostgresDatabaseModule,
    BullMqModule,
    MailModule,
    ReservationsModule,
    ChargingSessionsModule,
  ],
  providers: [
    ReservationNoShowProcessor,
    ChargingSessionCompletionProcessor,
    ReservationNoShowRecoveryService,
    ChargingSessionCompletionRecoveryService,
  ],
})
export class WorkerModule {}
