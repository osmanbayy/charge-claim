import { Injectable, NotFoundException } from '@nestjs/common';
import type { StationEntity } from './entities/station.entity';
import { StationsRepository } from './repositories/stations.repository';

@Injectable()
export class StationsService {
  constructor(private readonly stationsRepository: StationsRepository) {}

  findAll(): Promise<StationEntity[]> {
    return this.stationsRepository.findAll();
  }

  async findById(id: number): Promise<StationEntity> {
    const station = await this.stationsRepository.findById(id);
    if (!station) throw new NotFoundException('Station noıt found.');

    return station;
  }
}
