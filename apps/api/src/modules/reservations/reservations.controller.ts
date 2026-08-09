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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReservationsService } from './reservations.service';
import type { ReservationEntity } from './entities/reservation.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';

@ApiTags('Reservations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DRIVER')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a reservation for the authenticated driver',
  })
  @ApiCreatedResponse({
    type: ReservationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request body or reservation time is invalid.',
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
      'Connector is in maintenance or unavailable for the selected range.',
  })
  createReservation(
    @CurrentUser() currentUser: JwtPayload,
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<ReservationEntity> {
    return this.reservationsService.createReservation(
      currentUser.sub,
      createReservationDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List reservations of the authenticated driver',
  })
  @ApiOkResponse({
    type: ReservationResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'DRIVER role is required.',
  })
  findReservations(
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ReservationEntity[]> {
    return this.reservationsService.findReservationsByUserId(currentUser.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an own reservation by ID',
  })
  @ApiOkResponse({
    type: ReservationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Reservation ID must be an integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'DRIVER role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Reservation was not found.',
  })
  findReservationByIdAndUserId(
    @Param('id', ParseIntPipe) reservationId: number,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ReservationEntity | null> {
    return this.reservationsService.findReservationByIdAndUserId(
      reservationId,
      currentUser.sub,
    );
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel an own confirmed reservation',
  })
  @ApiOkResponse({
    type: ReservationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Reservation ID must be an integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'DRIVER role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Reservation was not found.',
  })
  @ApiConflictResponse({
    description:
      'Reservation status or start time does not allow cancellation.',
  })
  cancelReservation(
    @Param('id', ParseIntPipe) reservationId: number,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ReservationEntity> {
    return this.reservationsService.cancelReservation(
      reservationId,
      currentUser.sub,
    );
  }
}
