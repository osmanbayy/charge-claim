import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, Min } from 'class-validator';
import {
  RESERVATION_DURATION_MINUTES,
  type ReservationDurationMinutes,
} from '../../../common/constants';

export class CreateReservationDto {
  @ApiProperty({
    description: 'Connector that will be reserved.',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  connectorId!: number;

  @ApiProperty({
    description: 'Reservation start time in ISO 8601 UTC format.',
    example: '2026-08-10T10:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  startAt!: string;

  @ApiProperty({
    description: 'Reservation duration in minutes.',
    enum: RESERVATION_DURATION_MINUTES,
    example: 60,
  })
  @IsInt()
  @IsIn(RESERVATION_DURATION_MINUTES)
  durationMinutes!: ReservationDurationMinutes;
}
