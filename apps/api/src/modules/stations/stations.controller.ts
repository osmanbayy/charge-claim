import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  StationResponseDto,
  StationWithConnectorsResponseDto,
} from './dto/station-response.dto';
import { ConnectorResponseDto } from '../connectors/dto/connector-response.dto';
import type { PaginatedStations } from './entities/paginated-stations.entity';
import { StationPaginationQueryDto } from './dto/station-pagination-query.dto';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}
  @Get()
  @ApiOperation({
    summary: 'List stations with their connectors',
  })
  @ApiOkResponse({
    type: StationWithConnectorsResponseDto,
    isArray: true,
  })
  findAll(): Promise<StationWithConnectors[]> {
    return this.stationsService.findAll();
  }

  @Get('page')
  @ApiOperation({
    summary: 'List stations with pagination',
  })
  @ApiOkResponse({
    description: 'Paginated stations with their connectors.',
  })
  @ApiBadRequestResponse({
    description: 'Pagination query parameters are invalid.',
  })
  findPage(
    @Query() query: StationPaginationQueryDto,
  ): Promise<PaginatedStations> {
    return this.stationsService.findPage(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a station by ID',
  })
  @ApiOkResponse({
    type: StationWithConnectorsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Station ID must be an integer.',
  })
  @ApiNotFoundResponse({
    description: 'Station was not found.',
  })
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StationWithConnectors> {
    return this.stationsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a station as STAFF',
  })
  @ApiCreatedResponse({
    type: StationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'STAFF role is required.',
  })
  create(@Body() createStationDto: CreateStationDto): Promise<StationEntity> {
    return this.stationsService.create(createStationDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update a station as STAFF',
  })
  @ApiOkResponse({
    type: StationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request or station ID is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'STAFF role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Station was not found.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStationDto: UpdateStationDto,
  ): Promise<StationEntity> {
    return this.stationsService.update(id, updateStationDto);
  }

  @Post(':stationId/connectors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a connector for a station as STAFF',
  })
  @ApiCreatedResponse({
    type: ConnectorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request or station ID is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'STAFF role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Station was not found.',
  })
  @ApiConflictResponse({
    description: 'Connector code already exists for this station.',
  })
  createConnector(
    @Param('stationId', ParseIntPipe) stationId: number,
    @Body() createConnectorDto: CreateConnectorDto,
  ): Promise<ConnectorEntity> {
    return this.stationsService.createConnector(stationId, createConnectorDto);
  }
}
