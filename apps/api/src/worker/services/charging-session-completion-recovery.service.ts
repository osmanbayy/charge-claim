import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ChargingSessionCompletionQueueService } from '../../modules/charging-sessions/charging-session-completion-queue.service';
import { ChargingSessionRepository } from '../../modules/charging-sessions/repositories/charging-sessions.repository';

const RECOVERY_INTERVAL_MS = 60_000;
const RECOVERY_BATCH_SIZE = 100;

@Injectable()
export class ChargingSessionCompletionRecoveryService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    ChargingSessionCompletionRecoveryService.name,
  );

  private recoveryInterval: ReturnType<typeof setInterval> | undefined;

  private isRecoveryRunning = false;

  constructor(
    private readonly chargingSessionsRepository: ChargingSessionRepository,
    private readonly completionQueueService: ChargingSessionCompletionQueueService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.recoverSafely();

    this.recoveryInterval = setInterval(() => {
      void this.recoverSafely();
    }, RECOVERY_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
    }
  }

  private async recoverSafely(): Promise<void> {
    if (this.isRecoveryRunning) return;

    this.isRecoveryRunning = true;

    try {
      const pendingSessions =
        await this.chargingSessionsRepository.findActiveSessionsPendingCompletion(
          new Date(),
          RECOVERY_BATCH_SIZE,
        );

      for (const chargingSession of pendingSessions) {
        try {
          await this.completionQueueService.schedule(
            chargingSession.id,
            chargingSession.plannedEndAt,
          );
        } catch (error: unknown) {
          const errorStack = error instanceof Error ? error.stack : undefined;

          this.logger.error(
            `Charging session ${chargingSession.id} could not be recovered.`,
            errorStack,
          );
        }
      }

      if (pendingSessions.length > 0) {
        this.logger.warn(
          `${pendingSessions.length} expired charging-session job(s) recovered.`,
        );
      }
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        'Charging-session completion recovery scan failed.',
        errorStack,
      );
    } finally {
      this.isRecoveryRunning = false;
    }
  }
}
