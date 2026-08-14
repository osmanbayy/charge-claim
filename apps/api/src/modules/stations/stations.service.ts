import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  StationEntity,
  StationWithConnectors,
  UpdateStationEntity,
} from './entities/station.entity';
import { StationsRepository } from './repositories/stations.repository';
import { ConnectorsService } from '../connectors/connectors.service';
import type {
  ConnectorEntity,
  ConnectorWithCurrentStatus,
} from '../connectors/entities/connector.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { CreateConnectorDto } from '../connectors/dto/create-connector.dto';
import type { PaginatedStations } from './entities/paginated-stations.entity';

@Injectable()
export class StationsService {
  constructor(
    private readonly stationsRepository: StationsRepository,
    private readonly connectorsService: ConnectorsService,
  ) {}

  async findAll(): Promise<StationWithConnectors[]> {
    // get all stations
    const stations = await this.stationsRepository.findAll();

    return this.attachConnectors(stations);
  }

  async findById(id: number): Promise<StationWithConnectors> {
    const station = await this.stationsRepository.findById(id);
    if (!station) throw new NotFoundException('Station noıt found.');

    const connectors = await this.connectorsService.findByStationIds([id]);

    return { ...station, connectors };
  }

  async create(createdStationDto: CreateStationDto): Promise<StationEntity> {
    return this.stationsRepository.create({
      name: createdStationDto.name,
      district: createdStationDto.district,
      address: createdStationDto.address,
      latitude: createdStationDto.latitude,
      longitude: createdStationDto.longitude,
    });
  }

  async update(
    id: number,
    updateStationDto: UpdateStationDto,
  ): Promise<StationEntity> {
    const changes: UpdateStationEntity = {};

    if (updateStationDto.name !== undefined)
      changes.name = updateStationDto.name;

    if (updateStationDto.district !== undefined) {
      changes.district = updateStationDto.district.trim();
    }

    if (updateStationDto.address !== undefined) {
      changes.address = updateStationDto.address.trim();
    }

    if (updateStationDto.latitude !== undefined) {
      changes.latitude = updateStationDto.latitude;
    }

    if (updateStationDto.longitude !== undefined) {
      changes.longitude = updateStationDto.longitude;
    }

    if (Object.keys(changes).length === 0)
      throw new BadRequestException(
        'At least one station field must be provided',
      );

    const updatedStation = await this.stationsRepository.update(id, changes);
    if (!updatedStation) throw new NotFoundException('Station not found.');

    return updatedStation;
  }

  async createConnector(
    stationId: number,
    createConnectorDto: CreateConnectorDto,
  ): Promise<ConnectorEntity> {
    const station = await this.stationsRepository.findById(stationId);
    if (!station) throw new NotFoundException('Station not found.');

    return this.connectorsService.create(stationId, createConnectorDto);
  }

  async findPage(page: number, limit: number): Promise<PaginatedStations> {
    const [stations, totalItems] = await Promise.all([
      this.stationsRepository.findPage(page, limit),
      this.stationsRepository.count(),
    ]);

    const items = await this.attachConnectors(stations);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }

  private async attachConnectors(
    stations: StationEntity[],
  ): Promise<StationWithConnectors[]> {
    if (stations.length === 0) return [];

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
}
