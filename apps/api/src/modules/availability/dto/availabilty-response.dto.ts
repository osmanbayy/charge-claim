import { ApiProperty } from '@nestjs/swagger';
import type { ConnectorType } from '../../../core/database/postgres/drizzle/schema/connectors.schema';

export class AvailabilityRangeResponseDto {
  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
    format: 'date-time',
  })
  startAt!: string;

  @ApiProperty({
    example: '2026-08-10T11:00:00.000Z',
    format: 'date-time',
  })
  endAt!: string;
}

export class AvailabilitySummaryResponseDto {
  @ApiProperty({
    example: 3,
  })
  availableStationCount!: number;

  @ApiProperty({
    example: 5,
  })
  availableConnectorCount!: number;
}

export class AvailableConnectorResponseDto {
  @ApiProperty({
    example: 5,
  })
  id!: number;

  @ApiProperty({
    example: 'DC-01',
  })
  code!: string;

  @ApiProperty({
    enum: ['TYPE_2', 'CCS2'],
    example: 'CCS2',
  })
  type!: ConnectorType;

  @ApiProperty({
    example: '60.00',
  })
  powerKw!: string;

  @ApiProperty({
    example: '11.50',
  })
  pricePerKWh!: string;
}

export class AvailableStationResponseDto {
  @ApiProperty({
    example: 2,
  })
  id!: number;

  @ApiProperty({
    example: 'Kadıköy Şarj İstasyonu',
  })
  name!: string;

  @ApiProperty({
    example: 'Kadıköy',
  })
  district!: string;

  @ApiProperty({
    example: 'Caferağa Mahallesi, Kadıköy',
  })
  address!: string;

  @ApiProperty({
    example: 40.9901,
  })
  latitude!: number;

  @ApiProperty({
    example: 29.0283,
  })
  longitude!: number;

  @ApiProperty({
    type: () => [AvailableConnectorResponseDto],
  })
  connectors!: AvailableConnectorResponseDto[];
}

export class AvailabilityResponseDto {
  @ApiProperty({
    type: () => AvailabilityRangeResponseDto,
  })
  range!: AvailabilityRangeResponseDto;

  @ApiProperty({
    type: () => AvailabilitySummaryResponseDto,
  })
  summary!: AvailabilitySummaryResponseDto;

  @ApiProperty({
    type: () => [AvailableStationResponseDto],
  })
  stations!: AvailableStationResponseDto[];
}
