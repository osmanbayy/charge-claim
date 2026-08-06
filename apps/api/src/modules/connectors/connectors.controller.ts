import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import type {
  ConnectorEntity,
  ConnectorWithCurrentStatus,
} from './entities/connector.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateConnectorDto } from './dto/update-connector.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ConnectorResponseDto,
  ConnectorWithCurrentStatusResponseDto,
} from './dto/connector-response.dto';

@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get a connector with its current status',
  })
  @ApiOkResponse({
    type: ConnectorWithCurrentStatusResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Connector ID must be an integer.',
  })
  @ApiNotFoundResponse({
    description: 'Connector was not found.',
  })
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConnectorWithCurrentStatus> {
    return this.connectorsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update a connector as STAFF',
  })
  @ApiOkResponse({
    type: ConnectorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request or connector ID is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'STAFF role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Connector was not found.',
  })
  @ApiConflictResponse({
    description: 'Connector code already exists for this station.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConnectorDto: UpdateConnectorDto,
  ): Promise<ConnectorEntity> {
    return this.connectorsService.update(id, updateConnectorDto);
  }
}
