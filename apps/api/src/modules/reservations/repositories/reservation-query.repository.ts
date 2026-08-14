import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import type { PostgresTransaction } from '../../../core/database/postgres/postgres-transaction.type';
import { reservations } from '../../../core/database/postgres/drizzle/schema';
import type { ReservationEntity } from '../entities/reservation.entity';

@Injectable()
export class ReservationQueryRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  findByUserId(userId: number): Promise<ReservationEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(reservations)
      .where(eq(reservations.userId, userId))
      .orderBy(desc(reservations.startAt));
  }

  async findByIdAndUserId(
    userId: number,
    reservationId: number,
  ): Promise<ReservationEntity | null> {
    const [reservation] = await this.postgresDbService.database
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.userId, userId),
        ),
      )
      .limit(1);

    return reservation ?? null;
  }

  async findByIdAndUserIdForUpdate(
    transaction: PostgresTransaction,
    reservationId: number,
    userId: number,
  ): Promise<ReservationEntity | null> {
    const [reservation] = await transaction
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.userId, userId),
        ),
      )
      .for('update')
      .limit(1);

    return reservation ?? null;
  }

  async findByIdForUpdate(
    transaction: PostgresTransaction,
    reservationId: number,
  ): Promise<ReservationEntity | null> {
    const [reservation] = await transaction
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .for('update')
      .limit(1);

    return reservation ?? null;
  }
}
