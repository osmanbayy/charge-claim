import { Injectable } from '@nestjs/common';
import { and, asc, eq, isNull, lte, or } from 'drizzle-orm';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import {
  reservations,
  users,
} from '../../../core/database/postgres/drizzle/schema';
import type { ReservationEntity } from '../entities/reservation.entity';

export interface NoShowNotificationEntity {
  reservationId: number;
  reservationStartAt: Date;
  recipientName: string;
  recipientEmail: string;
}

@Injectable()
export class NoShowNotificationRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  findPendingProcessing(
    currentTime: Date,
    limit: number,
  ): Promise<ReservationEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(reservations)
      .where(
        or(
          and(
            eq(reservations.status, 'CONFIRMED'),
            lte(reservations.noShowDeadlineAt, currentTime),
          ),
          and(
            eq(reservations.status, 'NO_SHOW'),
            isNull(reservations.noShowEmailSentAt),
          ),
        ),
      )
      .orderBy(asc(reservations.noShowDeadlineAt))
      .limit(limit);
  }

  async findPendingNotification(
    reservationId: number,
  ): Promise<NoShowNotificationEntity | null> {
    const [notification] = await this.postgresDbService.database
      .select({
        reservationId: reservations.id,
        reservationStartAt: reservations.startAt,
        recipientName: users.name,
        recipientEmail: users.email,
      })
      .from(reservations)
      .innerJoin(users, eq(users.id, reservations.userId))
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, 'NO_SHOW'),
          isNull(reservations.noShowEmailSentAt),
        ),
      )
      .limit(1);

    return notification ?? null;
  }

  async markEmailAsSent(reservationId: number, sentAt: Date): Promise<boolean> {
    const [updatedReservation] = await this.postgresDbService.database
      .update(reservations)
      .set({ noShowEmailSentAt: sentAt, updatedAt: sentAt })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, 'NO_SHOW'),
          isNull(reservations.noShowEmailSentAt),
        ),
      )
      .returning({ id: reservations.id });

    return updatedReservation !== undefined;
  }
}
