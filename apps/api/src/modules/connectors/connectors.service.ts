import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConnectorsRepository } from './repositories/connectors.repository';
import type {
  ConnectorEntity,
  ConnectorWithCurrentStatus,
  UpdateConnectorEntity,
} from './entities/connector.entity';
import { CreateConnectorDto } from './dto/create-connector.dto';
import { UpdateConnectorDto } from './dto/update-connector.dto';
import { PostgresDatabaseService } from '../../core/database/postgres/postgres-database.service';
import { UpdateConnectorOperationalStatusDto } from './dto/update-connector-operational-status.dto';
import {
  getPostgresErrorConstraint,
  hasPostgresErrorCode,
  POSTGRES_UNIQUE_VIOLATION_CODE,
} from '../../core/database/postgres/postgres-error.util';

@Injectable()
export class ConnectorsService {
  constructor(
    private readonly connectorsRepository: ConnectorsRepository,
    private readonly postgresDbService: PostgresDatabaseService,
  ) {}

  async findById(id: number): Promise<ConnectorWithCurrentStatus> {
    const connector = await this.connectorsRepository.findById(id);
    if (!connector) throw new NotFoundException('Connector Not found.');

    return connector;
  }

  findByStationIds(
    stationIds: number[],
  ): Promise<ConnectorWithCurrentStatus[]> {
    return this.connectorsRepository.findByStationIds(stationIds);
  }

  async create(
    stationId: number,
    createConnectorDto: CreateConnectorDto,
  ): Promise<ConnectorEntity> {
    const normalCode = createConnectorDto.code.trim().toUpperCase();
    if (normalCode.length < 2)
      throw new BadRequestException(
        'Connector code must contain at least 2 characters.',
      );

    const existingConnector =
      await this.connectorsRepository.findByStationIdAndCode(
        stationId,
        normalCode,
      );
    if (existingConnector)
      throw new ConflictException(
        'Connector code already exist for this station',
      );

    try {
      return await this.connectorsRepository.create({
        stationId,
        code: normalCode,
        type: createConnectorDto.type,
        powerKw: createConnectorDto.powerKw,
        pricePerKWh: createConnectorDto.pricePerKWh,
      });
    } catch (error: unknown) {
      return this.handleConnectorWriteError(error);
    }
  }

  async update(
    id: number,
    updateConnectorDto: UpdateConnectorDto,
  ): Promise<ConnectorEntity> {
    const connector = await this.findById(id);
    const changes: UpdateConnectorEntity = {};

    if (updateConnectorDto.code !== undefined) {
      const normalCode = updateConnectorDto.code.trim().toUpperCase();

      if (normalCode.length < 2)
        throw new BadRequestException(
          'Connector code must contain at least 2 characters.',
        );

      const connectorWithSameCode =
        await this.connectorsRepository.findByStationIdAndCode(
          connector.stationId,
          normalCode,
        );
      if (connectorWithSameCode && connectorWithSameCode.id !== connector.id)
        throw new ConflictException(
          'Connector code already exist for this station',
        );

      changes.code = normalCode;
    }

    if (updateConnectorDto.type !== undefined)
      changes.type = updateConnectorDto.type;

    if (updateConnectorDto.powerKw !== undefined)
      changes.powerKw = updateConnectorDto.powerKw;

    if (updateConnectorDto.pricePerKWh !== undefined)
      changes.pricePerKWh = updateConnectorDto.pricePerKWh;

    if (Object.keys(changes).length === 0)
      throw new BadRequestException(
        'At least one connector field must be provided.',
      );

    let updatedConnector: ConnectorEntity | null;

    try {
      updatedConnector = await this.connectorsRepository.update(id, changes);
    } catch (error: unknown) {
      return this.handleConnectorWriteError(error);
    }

    if (updatedConnector === null)
      throw new NotFoundException('Connector nor found.');

    return updatedConnector;
  }

  async updateOperationalStatus(
    connectorId: number,
    updateOperationalStatusDto: UpdateConnectorOperationalStatusDto,
  ): Promise<ConnectorEntity> {
    return this.postgresDbService.database.transaction(async (transaction) => {
      // transaction opened and connector row locked
      const connector = await this.connectorsRepository.findByIdForUpdate(
        transaction,
        connectorId,
      );
      if (connector === null)
        throw new NotFoundException('Connector not found.');

      // requested status = connectorOperationalStatus -> don't perform unnecessary update
      const requestedStatus = updateOperationalStatusDto.operationalStatus;
      if (connector.operationalStatus === requestedStatus) return connector;

      if (requestedStatus === 'MAINTENANCE') {
        // checking for an active charge session
        const hasActiveChargeSession =
          await this.connectorsRepository.hasActiveChargingSession(
            transaction,
            connectorId,
          );
        if (hasActiveChargeSession)
          throw new ConflictException(
            'Connector cannot be placed into maintenance while it has an active charging session.',
          );

        // checking confirmed reservations for feature
        const hasUpcomingConfirmedReservation =
          await this.connectorsRepository.hasUpcomingConfirmedReservation(
            transaction,
            connectorId,
            new Date(),
          );
        if (hasUpcomingConfirmedReservation)
          throw new ConflictException(
            'Connector cannot be placed into maintenance while it has a confirmed reservation',
          );
      }

      const updatedConnector =
        await this.connectorsRepository.updateOperationalStatus(
          transaction,
          connectorId,
          requestedStatus,
        );
      if (updatedConnector === null)
        throw new NotFoundException('Connector not found.');

      return updatedConnector;
    });
  }

  private handleConnectorWriteError(error: unknown): never {
    const isConnectorCodeConflict =
      hasPostgresErrorCode(error, POSTGRES_UNIQUE_VIOLATION_CODE) &&
      getPostgresErrorConstraint(error) === 'connectors_station_id_code_unique';

    if (isConnectorCodeConflict)
      throw new ConflictException(
        'Connector code already exists for this station.',
      );

    throw error;
  }
}
