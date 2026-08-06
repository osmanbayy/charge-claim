import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type {
  StationEntity,
  StationWithConnectors,
} from './entities/station.entity';
import { StationsService } from './stations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { CreateConnectorDto } from '../connectors/dto/create-connector.dto';
import { ConnectorEntity } from '../connectors/entities/connector.entity';

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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  create(@Body() createStationDto: CreateStationDto): Promise<StationEntity> {
    return this.stationsService.create(createStationDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStationDto: UpdateStationDto,
  ): Promise<StationEntity> {
    return this.stationsService.update(id, updateStationDto);
  }

  @Post(':stationId/connectors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  createConnector(
    @Param('stationId', ParseIntPipe) stationId: number,
    @Body() createConnectorDto: CreateConnectorDto,
  ): Promise<ConnectorEntity> {
    return this.stationsService.createConnector(stationId, createConnectorDto);
  }
}
