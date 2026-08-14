import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import {
  PROCESS_RESERVATION_NO_SHOW_JOB,
  RESERVATION_NO_SHOW_QUEUE,
  type ReservationNoShowJobData,
} from '../common/queues/reservation-no-show.queue';
import { MailService } from '../core/mail/mail.service';
import { PostgresDatabaseService } from '../core/database/postgres/postgres-database.service';
import { ReservationQueryRepository } from '../modules/reservations/repositories/reservation-query.repository';
import { ReservationCommandRepository } from '../modules/reservations/repositories/reservation-command.repository';
import { NoShowNotificationRepository } from '../modules/reservations/repositories/no-show-notification.repository';

interface NoShowProcessingResult {
  wasMarkedAsNoShow: boolean;
  shouldSendEmail: boolean;
}

@Processor(RESERVATION_NO_SHOW_QUEUE)
export class ReservationNoShowProcessor extends WorkerHost {
  private readonly logger = new Logger(ReservationNoShowProcessor.name);

  constructor(
    private readonly postgresDbService: PostgresDatabaseService,
    private readonly reservationQueries: ReservationQueryRepository,
    private readonly reservationCommands: ReservationCommandRepository,
    private readonly noShowNotifications: NoShowNotificationRepository,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job<ReservationNoShowJobData>): Promise<void> {
    if (job.name !== PROCESS_RESERVATION_NO_SHOW_JOB) {
      throw new Error(`Unsupported no-show job: ${job.name}`);
    }

    const { reservationId } = job.data;

    const processingResult = await this.postgresDbService.database.transaction(
      async (transaction): Promise<NoShowProcessingResult> => {
        const reservation = await this.reservationQueries.findByIdForUpdate(
          transaction,
          reservationId,
        );

        if (reservation === null) {
          this.logger.warn(`Reservation ${reservationId} was not found.`);

          return {
            wasMarkedAsNoShow: false,
            shouldSendEmail: false,
          };
        }

        if (reservation.status === 'NO_SHOW') {
          return {
            wasMarkedAsNoShow: false,
            shouldSendEmail: reservation.noShowEmailSentAt === null,
          };
        }

        if (reservation.status !== 'CONFIRMED') {
          return {
            wasMarkedAsNoShow: false,
            shouldSendEmail: false,
          };
        }

        const processedAt = new Date();

        if (reservation.noShowDeadlineAt.getTime() > processedAt.getTime()) {
          throw new Error(
            `No-show deadline has not been reached for reservation ${reservationId}.`,
          );
        }

        const noShowReservation = await this.reservationCommands.markAsNoShow(
          transaction,
          reservationId,
          processedAt,
        );

        const wasMarkedAsNoShow = noShowReservation !== null;

        return {
          wasMarkedAsNoShow,
          shouldSendEmail: wasMarkedAsNoShow,
        };
      },
    );

    if (processingResult.wasMarkedAsNoShow) {
      this.logger.log(
        `Reservation ${reservationId} marked as NO_SHOW. Job ID: ${job.id}.`,
      );
    }

    if (!processingResult.shouldSendEmail) {
      return;
    }

    await this.sendNoShowEmail(reservationId);
  }

  private async sendNoShowEmail(reservationId: number): Promise<void> {
    const notification =
      await this.noShowNotifications.findPendingNotification(reservationId);

    if (notification === null) {
      this.logger.log(
        `No-show email is not pending for reservation ${reservationId}.`,
      );

      return;
    }

    await this.mailService.sendNoShowEmail({
      recipientName: notification.recipientName,
      recipientEmail: notification.recipientEmail,
      reservationId: notification.reservationId,
      reservationStartAt: notification.reservationStartAt,
    });

    const wasMarkedAsSent = await this.noShowNotifications.markEmailAsSent(
      reservationId,
      new Date(),
    );

    if (!wasMarkedAsSent) {
      this.logger.warn(
        `No-show email sent marker could not be updated for reservation ${reservationId}.`,
      );

      return;
    }

    this.logger.log(`No-show email sent for reservation ${reservationId}.`);
  }
}
