import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import {
  PROCESS_RESERVATION_NO_SHOW_JOB,
  RESERVATION_NO_SHOW_QUEUE,
  type ReservationNoShowJobData,
} from '../common/queues/reservation-no-show.queue';
import { PostgresDatabaseService } from '../core/database/postgres/postgres-database.service';
import { ReservationsRepository } from '../modules/reservations/repositories/reservations.repository';

@Processor(RESERVATION_NO_SHOW_QUEUE)
export class ReservationNoShowProcessor extends WorkerHost {
  private readonly logger = new Logger(ReservationNoShowProcessor.name);

  constructor(
    private readonly postgresDbService: PostgresDatabaseService,
    private readonly reservationsRepository: ReservationsRepository,
  ) {
    super();
  }

  async process(job: Job<ReservationNoShowJobData>): Promise<void> {
    if (job.name !== PROCESS_RESERVATION_NO_SHOW_JOB)
      throw new Error(`Unsupported no-show job: ${job.name}`);

    const { reservationId } = job.data;

    const wasMarkedAsNoShow = await this.postgresDbService.database.transaction(
      async (transaction) => {
        const reservation =
          await this.reservationsRepository.findReservationByIdForUpdate(
            transaction,
            reservationId,
          );
        if (reservation === null) {
          this.logger.warn(`Reservation ${reservationId} was not found.`);
          return false;
        }

        const processedAt = new Date();

        if (reservation.noShowDeadlineAt.getTime() > processedAt.getTime())
          throw new Error(
            `No-show deadline has not been reached for reservation ${reservationId}.`,
          );

        const noShowReservation =
          await this.reservationsRepository.markReservationAsNoShow(
            transaction,
            reservationId,
            processedAt,
          );

        return noShowReservation !== null;
      },
    );
    if (!wasMarkedAsNoShow) return;

    this.logger.log(
      `Reservation ${reservationId} marked as NO_SHOW. Job ID: ${job.id}.`,
    );
  }
}
