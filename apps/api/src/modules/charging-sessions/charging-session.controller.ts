import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChargingSessionsService } from './charging-session.service';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
}
