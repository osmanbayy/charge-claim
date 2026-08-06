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

@Injectable()
export class ConnectorsService {
  constructor(private readonly connectorsRepository: ConnectorsRepository) {}

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
        createConnectorDto.code,
      );
    if (existingConnector)
      throw new ConflictException(
        'Connector code already exist for this station',
      );

    return this.connectorsRepository.create({
      stationId,
      code: normalCode,
      type: createConnectorDto.type,
      powerKw: createConnectorDto.powerKw,
      pricePerKWh: createConnectorDto.pricePerKWh,
    });
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

    const updatedConnector = await this.connectorsRepository.update(
      id,
      changes,
    );
    if (updatedConnector === null)
      throw new NotFoundException('Connector nor found.');

    return updatedConnector;
  }
}
