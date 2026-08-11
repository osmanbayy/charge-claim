import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostgresDatabaseService } from '../../core/database/postgres/postgres-database.service';
import { ReservationsRepository } from '../reservations/repositories/reservations.repository';
import type { StartChargingFromReservationDto } from './dto/start-charging-from-reservation.dto';
import type { ChargingSessionEntity } from './entities/charging-session.entity';
import { ChargingSessionRepository } from './repositories/charging-sessions.repository';
import { MILLISECONDS_PER_MINUTE } from '../../common/constants';
import type { StartWalkInChargingDto } from './dto/start-walk-in-charging.dto';

@Injectable()
export class ChargingSessionsService {
  constructor(
    private readonly postgresDbService: PostgresDatabaseService,
    private readonly reservationsRepository: ReservationsRepository,
    private readonly chargingSessionsRepository: ChargingSessionRepository,
  ) {}

  startChargingFromReservation(
    userId: number,
    input: StartChargingFromReservationDto,
  ): Promise<ChargingSessionEntity> {
    return this.postgresDbService.database.transaction(async (transaction) => {
      // lock the reservation row
      const reservartion =
        await this.reservationsRepository.findReservationByIdAnUserIdForUpdate(
          transaction,
          input.reservationId,
          userId,
        );
      if (reservartion === null)
        throw new NotFoundException('Reservation Not found.');

      // only confirmed reservations can be initiate charging
      if (reservartion.status !== 'CONFIRMED')
        throw new ConflictException({
          code: 'RESERVATION_CANNOT_BE_STARTED',
          message: 'Only a confirmed reservation can start a charging session.',
        });

      const startedAt = new Date();

      const isInsideStartWindow =
        reservartion.startAt.getTime() <= startedAt.getTime() &&
        startedAt.getTime() < reservartion.noShowDeadlineAt.getTime();
      if (!isInsideStartWindow)
        throw new ConflictException({
          code: 'RESERVATION_START_WINDOW_CLOSED',
          message:
            'The charging session can only be started during the reservation start window.',
        });

      // lock the connector row
      const connector =
        await this.reservationsRepository.findConnectorByIdForUpdate(
          transaction,
          reservartion.connectorId,
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

      const chargingSession =
        await this.chargingSessionsRepository.createChargeSession(transaction, {
          userId,
          connectorId: connector.id,
          reservationId: reservartion.id,
          status: 'ACTIVE',
          startedAt,
          plannedEndAt: reservartion.endAt,
          powerKwSnapshot: connector.powerKw,
          pricePerKWhSnapshot: connector.pricePerKWh,
        });

      const updatedReservation =
        await this.reservationsRepository.markReservationAsInProgress(
          transaction,
          reservartion.id,
          userId,
          startedAt,
        );
      if (updatedReservation === null)
        throw new ConflictException({
          code: 'RESERVATION_CANNOT_BE_STARTED',
          message: 'Reservation could not be moved to the in-progress state.',
        });

      return chargingSession;
    });
  }

  startManuelCharging(
    userId: number,
    input: StartWalkInChargingDto,
  ): Promise<ChargingSessionEntity> {
    return this.postgresDbService.database.transaction(async (transaction) => {
      const startedAt = new Date();

      const plannedEndAt = new Date(
        startedAt.getTime() + input.durationMinutes * MILLISECONDS_PER_MINUTE,
      );

      // lock the connector
      const connector =
        await this.reservationsRepository.findConnectorByIdForUpdate(
          transaction,
          input.connectorId,
        );
      if (connector === null)
        throw new NotFoundException('Connector not found.');

      // check the connector's operational status
      if (connector.operationalStatus === 'MAINTENANCE')
        throw new ConflictException({
          code: 'CONNECTOR_IN_MAINTENANCE',
          message: 'Connector is currently in maintenance.',
        });

      // check the user has an active charging session
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

      // check the connector has an active chrging session
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

      // check the reservation conflict
      const hasOverlappingReservation =
        await this.reservationsRepository.hasOverlappingReservation(
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

      // eveything is ok -> start the charge
      return this.chargingSessionsRepository.createChargeSession(transaction, {
        userId,
        connectorId: connector.id,
        reservationId: null,
        status: 'ACTIVE',
        startedAt,
        plannedEndAt,
        powerKwSnapshot: connector.powerKw,
        pricePerKWhSnapshot: connector.pricePerKWh,
      });
    });
  }
}
