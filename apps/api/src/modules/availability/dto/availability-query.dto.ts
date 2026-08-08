import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  CONNECTOR_TYPES,
  type ConnectorType,
} from '../../../core/database/postgres/drizzle/schema';
import { Type } from 'class-transformer';

export class AvailabilityQueryDto {
  @ApiProperty({
    description: 'Requested range start time in ISO 8601 UTC format.',
    example: '2026-08-10T10:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  startAt!: string;

  @ApiProperty({
    description: 'Requested range end time in ISO 8601 UTC format.',
    example: '2026-08-10T11:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  endAt!: string;

  @ApiPropertyOptional({
    description: 'Filter stations by Istanbul district.',
    example: 'Kadıköy',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  district?: string;

  @ApiPropertyOptional({
    description: 'Filter connectors by connector type.',
    enum: CONNECTOR_TYPES,
    example: 'CCS2',
  })
  @IsOptional()
  @IsIn(CONNECTOR_TYPES)
  connectorType?: ConnectorType;

  @ApiPropertyOptional({
    description: 'Minimum connector power in kW.',
    example: 50,
    minimum: 0.01,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0.01)
  minPowerKw?: number;
}
