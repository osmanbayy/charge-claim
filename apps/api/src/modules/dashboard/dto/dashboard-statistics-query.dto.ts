import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardStatisticsQueryDto {
  @ApiProperty({
    description: 'Statistics range start in ISO 8601 format.',
    example: '2026-08-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  startAt!: string;

  @ApiProperty({
    description: 'Statistics range end in ISO 8601 format.',
    example: '2026-09-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  endAt!: string;

  @ApiPropertyOptional({
    description: 'Optional station filter.',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stationId?: number;

  @ApiPropertyOptional({
    description: 'Optional district filter.',
    example: 'Kadıköy',
  })
  @IsOptional()
  @IsString()
  district?: string;
}
