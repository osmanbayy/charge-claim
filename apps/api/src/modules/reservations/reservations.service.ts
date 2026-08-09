import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppConfigService } from '../../core/config/app-config.service';
import type { CreateReservationDto } from './dto/create-reservation.dto';
import { MILLISECONDS_PER_MINUTE } from '../../common/constants';
import { PostgresDatabaseService } from '../../core/database/postgres/postgres-database.service';
import { ReservationsRepository } from './repositories/reservations.repository';
import type { ReservationEntity } from './entities/reservation.entity';
import {
  hasPostgresErrorCode,
  POSTGRES_EXCLUSION_VIOLATION_CODE,
} from '../../core/database/postgres/postgres-error.util';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly postgresDbService: PostgresDatabaseService,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async createReservation(
    userId: number,
    createReservationDto: CreateReservationDto,
  ): Promise<ReservationEntity> {
    // validate times and start
    const { startAt, endAt, noShowDeadlineAt } =
      this.calculateReservationTimes(createReservationDto);

    try {
      // start the transaction
      return this.postgresDbService.database.transaction(
        async (transaction) => {
          // lock the connector row
          const connector =
            await this.reservationsRepository.findConnectorByIdForUpdate(
              transaction,
              createReservationDto.connectorId,
            );
          // check the connector
          if (connector === null)
            throw new NotFoundException('Connector not found.');
          if (connector.operationalStatus === 'MAINTENANCE')
            throw new ConflictException(
              'Connector is currently in manitenance',
            );

          // check for overlapping reservation
          const hasOverlappingReservation =
            await this.reservationsRepository.hasOverlappingReservation(
              transaction,
              connector.id,
              startAt,
              endAt,
            );
          if (hasOverlappingReservation)
            throw this.createTimeConflictException();

          // check for overlapping actice charging session
          const hasOverlappingActiveChargingSession =
            await this.reservationsRepository.hasOverlappingActiveChargeSession(
              transaction,
              connector.id,
              startAt,
              endAt,
            );
          if (hasOverlappingActiveChargingSession)
            throw this.createTimeConflictException();

          // if evething is ok -> reservation insert
          return this.reservationsRepository.createReservation(transaction, {
            userId,
            connectorId: connector.id,
            startAt,
            endAt,
            noShowDeadlineAt,
          });
        },
      );
    } catch (error: unknown) {
      if (hasPostgresErrorCode(error, POSTGRES_EXCLUSION_VIOLATION_CODE))
        throw this.createTimeConflictException();

      throw error;
    }
  }

  findReservationsByUserId(userId: number): Promise<ReservationEntity[]> {
    return this.reservationsRepository.findReservationsByUserId(userId);
  }

  async findReservationByIdAndUserId(
    reservationId: number,
    userId: number,
  ): Promise<ReservationEntity | null> {
    const reservation =
      await this.reservationsRepository.findReservationByIdAndUserId(
        userId,
        reservationId,
      );
    if (reservation === null)
      throw new NotFoundException('Reservation not found.');

    return reservation;
  }

  async cancelReservation(
    reservationId: number,
    userId: number,
  ): Promise<ReservationEntity> {
    // open the transaction
    return this.postgresDbService.database.transaction(async (transaction) => {
      // find reservation with id and userid and lock
      const reservation =
        await this.reservationsRepository.findReservationByIdAnUserIdForUpdate(
          transaction,
          reservationId,
          userId,
        );
      if (reservation === null)
        throw new NotFoundException('Reservation not found.');
      if (reservation.status !== 'CONFIRMED')
        throw new ConflictException(
          'Only a confirmed reservation can be cancelled.',
        );

      // start time has arrived or passed -> 409
      const now = new Date();
      if (now.getTime() >= reservation.startAt.getTime())
        throw new ConflictException(
          'Reservation can only be cancelled before its start time.',
        );

      // update as cancelled
      const cancelledReservation =
        await this.reservationsRepository.cancelReservation(
          transaction,
          reservationId,
          now,
        );
      if (cancelledReservation === null)
        throw new ConflictException('Reservation could not be cancelled.');

      return cancelledReservation;
    });
  }

  private createTimeConflictException(): ConflictException {
    return new ConflictException({
      code: 'RESERVATION_TIME_CONFLICT',
      message: 'The connector is unavailable for the selected time range.',
    });
  }

  calculateReservationTimes(createReservationDto: CreateReservationDto): {
    startAt: Date;
    endAt: Date;
    noShowDeadlineAt: Date;
  } {
    const startAt = new Date(createReservationDto.startAt);
    const startAtMilliseconds = startAt.getTime();
    if (startAtMilliseconds <= Date.now())
      throw new BadRequestException(
        'Reservation start time must be in the future.',
      );

    const startsOnThirtyMinuteBoundary =
      (startAt.getUTCMinutes() === 0 || startAt.getUTCMinutes() === 30) &&
      startAt.getUTCSeconds() === 0 &&
      startAt.getUTCMilliseconds() === 0;
    if (!startsOnThirtyMinuteBoundary)
      throw new BadRequestException(
        'Reservation start time must be on a 30-minute boundary.',
      );

    const durationMilliseconds =
      createReservationDto.durationMinutes * MILLISECONDS_PER_MINUTE;

    const noShowGraceMilliseconds =
      this.appConfigService.jobs.noShowGraceMinutes * MILLISECONDS_PER_MINUTE;

    const endAt = new Date(startAtMilliseconds + durationMilliseconds);

    const noShowDeadlineAt = new Date(
      startAtMilliseconds + noShowGraceMilliseconds,
    );

    return {
      startAt,
      endAt,
      noShowDeadlineAt,
    };
  }
}
