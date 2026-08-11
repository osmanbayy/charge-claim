import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';
import {
  RESERVATION_DURATION_MINUTES,
  type ReservationDurationMinutes,
} from '../../../common/constants';

export class StartWalkInChargingDto {
  @ApiProperty({
    description: 'Connector used for the walk-in charging session.',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  connectorId!: number;

  @ApiProperty({
    description: 'Planned charging duration in minutes.',
    enum: RESERVATION_DURATION_MINUTES,
    example: 60,
  })
  @IsInt()
  @IsIn(RESERVATION_DURATION_MINUTES)
  durationMinutes!: ReservationDurationMinutes;
}
