import { ApiProperty } from '@nestjs/swagger';
import {
  RESERVATION_STATUSES,
  type ReservationStatus,
} from '../../../core/database/postgres/drizzle/schema/reservations.schema';

export class ReservationResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 3 })
  userId!: number;

  @ApiProperty({ example: 5 })
  connectorId!: number;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
    format: 'date-time',
  })
  startAt!: Date;

  @ApiProperty({
    example: '2026-08-10T11:00:00.000Z',
    format: 'date-time',
  })
  endAt!: Date;

  @ApiProperty({
    example: '2026-08-10T10:15:00.000Z',
    format: 'date-time',
  })
  noShowDeadlineAt!: Date;

  @ApiProperty({
    enum: RESERVATION_STATUSES,
    example: 'CONFIRMED',
  })
  status!: ReservationStatus;

  @ApiProperty({
    example: null,
    nullable: true,
    format: 'date-time',
  })
  cancelledAt!: Date | null;

  @ApiProperty({
    example: null,
    nullable: true,
    format: 'date-time',
  })
  noShowEmailSentAt!: Date | null;

  @ApiProperty({
    example: '2026-08-09T12:00:00.000Z',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-09T12:00:00.000Z',
    format: 'date-time',
  })
  updatedAt!: Date;
}
