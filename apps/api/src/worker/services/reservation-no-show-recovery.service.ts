import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ReservationsRepository } from '../../modules/reservations/repositories/reservations.repository';
import { ReservationNoShowQueueService } from '../../modules/reservations/queues/reservation-no-show-queue.service';

const RECOVERY_INTERVAL_MS = 60_000;
const RECOVERY_BATCH_SIZE = 100;

@Injectable()
export class ReservationNoShowRecoveryService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ReservationNoShowRecoveryService.name);
  private recoveryInterval: ReturnType<typeof setInterval> | undefined;
  private isRecoveryRunning = false;

  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly noShowQueueService: ReservationNoShowQueueService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.recoverySafely();

    this.recoveryInterval = setInterval(() => {
      void this.recoverySafely();
    }, RECOVERY_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
    }
  }

  private async recoverySafely(): Promise<void> {
    if (this.isRecoveryRunning) return;
    this.isRecoveryRunning = true;

    try {
      const pendingReservations =
        await this.reservationsRepository.findReservationsPendingNoShowProcessing(
          new Date(),
          RECOVERY_BATCH_SIZE,
        );

      for (const reservation of pendingReservations) {
        try {
          await this.noShowQueueService.schedule(
            reservation.id,
            reservation.noShowDeadlineAt,
          );
        } catch (error: unknown) {
          const errorStack = error instanceof Error ? error.stack : undefined;

          this.logger.error(
            `Reservation ${reservation.id} could not be recovered.`,
            errorStack,
          );
        }
      }

      if (pendingReservations.length > 0) {
        this.logger.warn(
          `${pendingReservations.length} expired reservation job(s) recovered.`,
        );
      }
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error('No-show recovery scan failed.', errorStack);
    } finally {
      this.isRecoveryRunning = false;
    }
  }
}
