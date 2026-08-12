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
import { ChargingSessionsService } from './charging-session.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { ChargingSessionEntity } from './entities/charging-session.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StartChargingFromReservationDto } from './dto/start-charging-from-reservation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StartWalkInChargingDto } from './dto/start-walk-in-charging.dto';

@ApiTags('Charging Sessions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DRIVER')
@Controller('charging-sessions')
export class ChargingSessionsController {
  constructor(
    private readonly chargingSessionsService: ChargingSessionsService,
  ) {}

  @Post('from-reservation')
  @ApiOperation({
    summary: 'Start a charging session from an own reservation',
  })
  @ApiCreatedResponse({
    description: 'Charging session was started successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'DRIVER role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Reservation or connector was not found.',
  })
  @ApiConflictResponse({
    description:
      'The reservation cannot be started or the connector is unavailable.',
  })
  startChargingFromReservation(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: StartChargingFromReservationDto,
  ): Promise<ChargingSessionEntity> {
    return this.chargingSessionsService.startChargingFromReservation(
      currentUser.sub,
      dto,
    );
  }

  @Post('walk-in')
  @ApiOperation({
    summary: 'Start a walk-in charging session',
  })
  @ApiCreatedResponse({
    description: 'Walk-in charging session was started successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Connector ID or charging duration is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'DRIVER role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Connector was not found.',
  })
  @ApiConflictResponse({
    description:
      'The connector is unavailable or the driver already has an active session.',
  })
  startWalkInCharging(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: StartWalkInChargingDto,
  ): Promise<ChargingSessionEntity> {
    return this.chargingSessionsService.startWalkInCharging(
      currentUser.sub,
      dto,
    );
  }

  @Patch(':id/stop')
  @ApiOperation({
    summary: 'Stop an own active charging session',
  })
  @ApiOkResponse({
    description: 'Charging session was stopped successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Charging session ID must be an integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'DRIVER role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Charging session was not found.',
  })
  @ApiConflictResponse({
    description:
      'Charging session is not active or its reservation cannot be completed.',
  })
  stopChargingSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ChargingSessionEntity> {
    return this.chargingSessionsService.stopChargingSession(
      currentUser.sub,
      sessionId,
    );
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get the active charging session of the authenticated driver',
  })
  @ApiOkResponse({
    description:
      'Returns the active charging session or null when there is no active session.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'DRIVER role is required.',
  })
  findActiveSession(
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ChargingSessionEntity | null> {
    return this.chargingSessionsService.findActiveSessionByUserId(
      currentUser.sub,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List charging sessions of the authenticated driver',
  })
  @ApiOkResponse({
    description: 'Charging sessions were listed successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'DRIVER role is required.',
  })
  findChargingSessions(
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ChargingSessionEntity[]> {
    return this.chargingSessionsService.findSessionsByUserId(currentUser.sub);
  }
}
