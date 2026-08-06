import { Injectable, NotFoundException } from '@nestjs/common';
import type { StationWithConnectors } from './entities/station.entity';
import { StationsRepository } from './repositories/stations.repository';
import { ConnectorsService } from '../connectors/connectors.service';
import { ConnectorWithCurrentStatus } from '../connectors/entities/connector.entity';

@Injectable()
export class StationsService {
  constructor(
    private readonly stationsRepository: StationsRepository,
    private readonly connectorsService: ConnectorsService,
  ) {}

  async findAll(): Promise<StationWithConnectors[]> {
    // get all stations
    const stations = await this.stationsRepository.findAll();
    // create a list containing only ids of the stations
    const stationIds = stations.map((station) => station.id);

    // gel all connectors using the stations ids in the list (stationIds)
    const connectors =
      await this.connectorsService.findByStationIds(stationIds);

    const connectorsByStationId = new Map<
      number,
      ConnectorWithCurrentStatus[]
    >();

    for (const connector of connectors) {
      const stationConnectors =
        connectorsByStationId.get(connector.stationId) ?? [];

      stationConnectors.push(connector);

      connectorsByStationId.set(connector.stationId, stationConnectors);
    }

    return stations.map((station) => ({
      ...station,
      connectors: connectorsByStationId.get(station.id) ?? [],
    }));
  }

  async findById(id: number): Promise<StationWithConnectors> {
    const station = await this.stationsRepository.findById(id);
    if (!station) throw new NotFoundException('Station noıt found.');

    const connectors = await this.connectorsService.findByStationIds([id]);

    return { ...station, connectors };
  }
}
