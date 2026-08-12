import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import type {
  StaffDashboardLiveSnapshot,
  StaffDashboardStatistics,
} from './entities/dashboard.entity';
import { DashboardStatisticsQueryDto } from './dto/dashboard-statistics-query.dto';

@ApiTags('Staff Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF')
@Controller('staff/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('live')
  @ApiOperation({
    summary: 'Get the live operational dashboard snapshot',
  })
  @ApiOkResponse({
    description:
      'Connector status summary, active sessions and upcoming reservations.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'STAFF role is required.',
  })
  getLiveSnapshot(): Promise<StaffDashboardLiveSnapshot> {
    return this.dashboardService.getLiveSnapshot();
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get dashboard statistics for a selected date range',
  })
  @ApiOkResponse({
    description: 'Reservation, no-show, energy and revenue statistics.',
  })
  @ApiBadRequestResponse({
    description: 'Query validation failed or the date range is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid access token is required.',
  })
  @ApiForbiddenResponse({
    description: 'STAFF role is required.',
  })
  getStatistics(
    @Query() query: DashboardStatisticsQueryDto,
  ): Promise<StaffDashboardStatistics> {
    return this.dashboardService.getStatistics(query);
  }
}
