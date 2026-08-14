import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PostgresDatabaseService } from '../../core/database/postgres/postgres-database.service';
import { ReservationQueryRepository } from '../reservations/repositories/reservation-query.repository';
import { ReservationCommandRepository } from '../reservations/repositories/reservation-command.repository';
import { ReservationConflictRepository } from '../reservations/repositories/reservation-conflict.repository';
import type { StartChargingFromReservationDto } from './dto/start-charging-from-reservation.dto';
import type { ChargingSessionEntity } from './entities/charging-session.entity';
import { ChargingSessionRepository } from './repositories/charging-sessions.repository';
import { MILLISECONDS_PER_MINUTE } from '../../common/constants';
import type { StartWalkInChargingDto } from './dto/start-walk-in-charging.dto';
import { ChargingSessionCompletionQueueService } from './charging-session-completion-queue.service';
import {
  getPostgresErrorConstraint,
  hasPostgresErrorCode,
  POSTGRES_UNIQUE_VIOLATION_CODE,
} from '../../core/database/postgres/postgres-error.util';

@Injectable()
export class ChargingSessionsService {
  private readonly logger = new Logger(ChargingSessionsService.name);

  constructor(
    private readonly postgresDbService: PostgresDatabaseService,
    private readonly reservationQueries: ReservationQueryRepository,
    private readonly reservationCommands: ReservationCommandRepository,
    private readonly reservationConflicts: ReservationConflictRepository,
    private readonly chargingSessionsRepository: ChargingSessionRepository,
    private readonly completionQueueService: ChargingSessionCompletionQueueService,
  ) {}

  async startChargingFromReservation(
    userId: number,
    input: StartChargingFromReservationDto,
  ): Promise<ChargingSessionEntity> {
    const chargingSession: ChargingSessionEntity =
      await this.postgresDbService.database
        .transaction(async (transaction): Promise<ChargingSessionEntity> => {
          const reservation =
            await this.reservationQueries.findByIdAndUserIdForUpdate(
              transaction,
              input.reservationId,
              userId,
            );

          if (reservation === null)
            throw new NotFoundException('Reservation not found.');

          if (reservation.status !== 'CONFIRMED')
            throw new ConflictException({
              code: 'RESERVATION_CANNOT_BE_STARTED',
              message:
                'Only a confirmed reservation can start a charging session.',
            });

          const startedAt = new Date();

          const isInsideStartWindow =
            reservation.startAt.getTime() <= startedAt.getTime() &&
            startedAt.getTime() < reservation.noShowDeadlineAt.getTime();

          if (!isInsideStartWindow)
            throw new ConflictException({
              code: 'RESERVATION_START_WINDOW_CLOSED',
              message:
                'The charging session can only be started during the reservation start window.',
            });

          const connector =
            await this.reservationConflicts.findConnectorByIdForUpdate(
              transaction,
              reservation.connectorId,
            );

          if (connector === null)
            throw new NotFoundException('Connector not found.');

          if (connector.operationalStatus === 'MAINTENANCE')
            throw new ConflictException({
              code: 'CONNECTOR_IN_MAINTENANCE',
              message: 'Connector is currently in maintenance.',
            });

          const userHasActiveChargingSession =
            await this.chargingSessionsRepository.hasActiveSessionForUser(
              transaction,
              userId,
            );

          if (userHasActiveChargingSession)
            throw new ConflictException({
              code: 'CHARGING_SESSION_ALREADY_ACTIVE',
              message: 'The user already has an active charging session.',
            });

          const connectorHasActiveChargingSession =
            await this.chargingSessionsRepository.hasActiveSessionForConnector(
              transaction,
              connector.id,
            );

          if (connectorHasActiveChargingSession)
            throw new ConflictException({
              code: 'CONNECTOR_ALREADY_OCCUPIED',
              message: 'The connector already has an active charging session.',
            });

          const createdSession =
            await this.chargingSessionsRepository.createChargeSession(
              transaction,
              {
                userId,
                connectorId: connector.id,
                reservationId: reservation.id,
                status: 'ACTIVE',
                startedAt,
                plannedEndAt: reservation.endAt,
                powerKwSnapshot: connector.powerKw,
                pricePerKWhSnapshot: connector.pricePerKWh,
              },
            );

          const updatedReservation =
            await this.reservationCommands.markAsInProgress(
              transaction,
              reservation.id,
              userId,
              startedAt,
            );

          if (updatedReservation === null)
            throw new ConflictException({
              code: 'RESERVATION_CANNOT_BE_STARTED',
              message:
                'Reservation could not be moved to the in-progress state.',
            });

          return createdSession;
        })
        .catch((error: unknown): never => {
          return this.handleChargingSessionCreationError(error);
        });

    try {
      await this.completionQueueService.schedule(
        chargingSession.id,
        chargingSession.plannedEndAt,
      );
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Completion job could not be scheduled for charging session ${chargingSession.id}.`,
        errorStack,
      );
    }

    return chargingSession;
  }

  async startWalkInCharging(
    userId: number,
    input: StartWalkInChargingDto,
  ): Promise<ChargingSessionEntity> {
    const chargingSession: ChargingSessionEntity =
      await this.postgresDbService.database
        .transaction(async (transaction): Promise<ChargingSessionEntity> => {
          const startedAt = new Date();

          const plannedEndAt = new Date(
            startedAt.getTime() +
              input.durationMinutes * MILLISECONDS_PER_MINUTE,
          );

          const connector =
            await this.reservationConflicts.findConnectorByIdForUpdate(
              transaction,
              input.connectorId,
            );

          if (connector === null)
            throw new NotFoundException('Connector not found.');

          if (connector.operationalStatus === 'MAINTENANCE')
            throw new ConflictException({
              code: 'CONNECTOR_IN_MAINTENANCE',
              message: 'Connector is currently in maintenance.',
            });

          const userHasActiveChargingSession =
            await this.chargingSessionsRepository.hasActiveSessionForUser(
              transaction,
              userId,
            );

          if (userHasActiveChargingSession)
            throw new ConflictException({
              code: 'CHARGING_SESSION_ALREADY_ACTIVE',
              message: 'The user already has an active charging session.',
            });

          const connectorHasActiveChargingSession =
            await this.chargingSessionsRepository.hasActiveSessionForConnector(
              transaction,
              connector.id,
            );

          if (connectorHasActiveChargingSession)
            throw new ConflictException({
              code: 'CONNECTOR_ALREADY_OCCUPIED',
              message: 'The connector already has an active charging session.',
            });

          const hasOverlappingReservation =
            await this.reservationConflicts.hasOverlappingReservation(
              transaction,
              connector.id,
              startedAt,
              plannedEndAt,
            );

          if (hasOverlappingReservation)
            throw new ConflictException({
              code: 'CONNECTOR_RESERVED_FOR_SELECTED_RANGE',
              message:
                'The connector has a reservation during the selected charging period.',
            });

          return this.chargingSessionsRepository.createChargeSession(
            transaction,
            {
              userId,
              connectorId: connector.id,
              reservationId: null,
              status: 'ACTIVE',
              startedAt,
              plannedEndAt,
              powerKwSnapshot: connector.powerKw,
              pricePerKWhSnapshot: connector.pricePerKWh,
            },
          );
        })
        .catch((error: unknown): never => {
          return this.handleChargingSessionCreationError(error);
        });

    try {
      await this.completionQueueService.schedule(
        chargingSession.id,
        chargingSession.plannedEndAt,
      );
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Completion job could not be scheduled for charging session ${chargingSession.id}.`,
        errorStack,
      );
    }

    return chargingSession;
  }

  stopChargingSession(
    userId: number,
    sessionId: number,
  ): Promise<ChargingSessionEntity> {
    return this.postgresDbService.database.transaction(async (transaction) => {
      const chargingSession =
        await this.chargingSessionsRepository.findSessionByIdAndUserIdForUpdate(
          transaction,
          sessionId,
          userId,
        );

      if (chargingSession === null)
        throw new NotFoundException('Charging session not found.');

      if (chargingSession.status !== 'ACTIVE')
        throw new ConflictException({
          code: 'CHARGING_SESSION_NOT_ACTIVE',
          message: 'Only an active charging session can be stopped.',
        });

      const requestedEndAt = new Date();

      const endedAt =
        requestedEndAt.getTime() < chargingSession.plannedEndAt.getTime()
          ? requestedEndAt
          : chargingSession.plannedEndAt;

      const endReason =
        requestedEndAt.getTime() < chargingSession.plannedEndAt.getTime()
          ? 'USER_STOPPED'
          : 'TIME_LIMIT_REACHED';

      const completedSession =
        await this.chargingSessionsRepository.completeChargingSession(
          transaction,
          chargingSession.id,
          endedAt,
          endReason,
        );

      if (completedSession === null)
        throw new ConflictException({
          code: 'CHARGING_SESSION_NOT_ACTIVE',
          message: 'Charging session could not be completed.',
        });

      if (chargingSession.reservationId !== null) {
        const completedReservation =
          await this.reservationCommands.markAsCompleted(
            transaction,
            chargingSession.reservationId,
            endedAt,
          );

        if (completedReservation === null)
          throw new ConflictException({
            code: 'RESERVATION_CANNOT_BE_COMPLETED',
            message:
              'The reservation could not be moved to the completed state.',
          });
      }

      return completedSession;
    });
  }

  findActiveSessionByUserId(
    userId: number,
  ): Promise<ChargingSessionEntity | null> {
    return this.chargingSessionsRepository.findActiveSessionByUserId(userId);
  }

  findSessionsByUserId(userId: number): Promise<ChargingSessionEntity[]> {
    return this.chargingSessionsRepository.findSessionsByUserId(userId);
  }

  private handleChargingSessionCreationError(error: unknown): never {
    if (!hasPostgresErrorCode(error, POSTGRES_UNIQUE_VIOLATION_CODE))
      throw error;

    const constraintName = getPostgresErrorConstraint(error);
    if (constraintName === 'charging_session_active_user_unique')
      throw new ConflictException({
        code: 'CHARGING_SESSION_ALREADY_ACTIVE',
        message: 'The user already has an active charging session.',
      });

    if (constraintName === 'charging_session_active_connector_unique')
      throw new ConflictException({
        code: 'CONNECTOR_ALREADY_OCCUPIED',
        message: 'The connector already has an active charging session.',
      });

    throw error;
  }
}
