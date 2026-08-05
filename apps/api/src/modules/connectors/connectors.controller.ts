import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import type { ConnectorWithCurrentStatus } from './entities/connector.entity';

@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConnectorWithCurrentStatus> {
    return this.connectorsService.findById(id);
  }
}
