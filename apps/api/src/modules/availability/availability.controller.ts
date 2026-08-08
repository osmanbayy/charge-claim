import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { AvailabilityResponseDto } from './dto/availabilty-response.dto';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({
    summary: 'Find available connectors for a time range',
  })
  @ApiOkResponse({
    type: AvailabilityResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Query parameters or requested time range are invalid.',
  })
  getAvailability(
    @Query() queryDto: AvailabilityQueryDto,
  ): Promise<AvailabilityResponseDto> {
    return this.availabilityService.getAvailability(queryDto);
  }
}
