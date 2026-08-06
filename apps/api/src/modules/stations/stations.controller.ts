import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import type { StationWithConnectors } from './entities/station.entity';
import { StationsService } from './stations.service';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}
  @Get()
  findAll(): Promise<StationWithConnectors[]> {
    return this.stationsService.findAll();
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StationWithConnectors> {
    return this.stationsService.findById(id);
  }
}
