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

@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConnectorWithCurrentStatus> {
    return this.connectorsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConnectorDto: UpdateConnectorDto,
  ): Promise<ConnectorEntity> {
    return this.connectorsService.update(id, updateConnectorDto);
  }
}
