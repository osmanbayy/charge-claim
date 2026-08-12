import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import {
  CHARGING_SESSION_COMPLETION_QUEUE,
  COMPLETE_CHARGING_SESSION_JOB,
  type ChargingSessionCompletionJobData,
} from '../common/queues/charging-session-completion.queue';
import { PostgresDatabaseService } from '../core/database/postgres/postgres-database.service';
import { ChargingSessionRepository } from '../modules/charging-sessions/repositories/charging-sessions.repository';
import { ReservationsRepository } from '../modules/reservations/repositories/reservations.repository';

@Processor(CHARGING_SESSION_COMPLETION_QUEUE)
export class ChargingSessionCompletionProcessor extends WorkerHost {
  private readonly logger = new Logger(ChargingSessionCompletionProcessor.name);

  constructor(
    private readonly postgresDbService: PostgresDatabaseService,
    private readonly chargingSessionsRepository: ChargingSessionRepository,
    private readonly reservationsRepository: ReservationsRepository,
  ) {
    super();
  }

  async process(job: Job<ChargingSessionCompletionJobData>): Promise<void> {
    if (job.name !== COMPLETE_CHARGING_SESSION_JOB) {
      throw new Error(
        `Unsupported charging-session completion job: ${job.name}`,
      );
    }

    const { sessionId } = job.data;

    const wasCompleted = await this.postgresDbService.database.transaction(
      async (transaction): Promise<boolean> => {
        const chargingSession =
          await this.chargingSessionsRepository.findSessionByIdForUpdate(
            transaction,
            sessionId,
          );
        if (chargingSession === null) {
          this.logger.warn(`Charging session ${sessionId} was not found.`);

          return false;
        }

        if (chargingSession.status !== 'ACTIVE') return false;

        const currentTime = new Date();

        if (chargingSession.plannedEndAt.getTime() > currentTime.getTime())
          throw new Error(
            `Planned end time has not been reached for charging session ${sessionId}.`,
          );

        const completedSession =
          await this.chargingSessionsRepository.completeChargingSession(
            transaction,
            sessionId,
            chargingSession.plannedEndAt,
            'TIME_LIMIT_REACHED',
          );
        if (completedSession === null) return false;

        if (chargingSession.reservationId !== null) {
          const completedReservation =
            await this.reservationsRepository.markReservationAsCompleted(
              transaction,
              chargingSession.reservationId,
              chargingSession.plannedEndAt,
            );
          if (completedReservation === null)
            throw new Error(
              `Reservation ${chargingSession.reservationId} could not be completed.`,
            );
        }

        return true;
      },
    );

    if (wasCompleted)
      this.logger.log(
        `Charging session ${sessionId} completed automatically. Job ID: ${job.id}.`,
      );
  }
}
