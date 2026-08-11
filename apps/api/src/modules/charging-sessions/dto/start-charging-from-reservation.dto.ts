import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class StartChargingFromReservationDto {
  @ApiProperty({
    description: 'Reservation used to start the charging session.',
    example: 12,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  reservationId!: number;
}
