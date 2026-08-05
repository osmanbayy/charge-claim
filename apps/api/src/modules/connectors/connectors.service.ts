import { Injectable, NotFoundException } from '@nestjs/common';
import { ConnectorsRepository } from './repositories/connectors.repository';
import type { ConnectorWithCurrentStatus } from './entities/connector.entity';

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
}
