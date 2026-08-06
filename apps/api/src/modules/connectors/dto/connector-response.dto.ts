import { ApiProperty } from '@nestjs/swagger';
import {
  CONNECTOR_OPERATIONAL_STATUSES,
  CONNECTOR_TYPES,
  type ConnectorOperationalStatus,
  type ConnectorType,
} from '../../../core/database/postgres/drizzle/schema/connectors.schema';
import {
  CONNECTOR_CURRENT_STATUSES,
  type ConnectorCurrentStatus,
} from '../entities/connector.entity';

export class ConnectorResponseDto {
  id!: number;

  stationId!: number;

  code!: string;

  @ApiProperty({
    enum: CONNECTOR_TYPES,
    example: 'TYPE_2',
  })
  type!: ConnectorType;

  @ApiProperty({
    example: '22.00',
  })
  powerKw!: string;

  @ApiProperty({
    example: '8.50',
  })
  pricePerKWh!: string;

  @ApiProperty({
    enum: CONNECTOR_OPERATIONAL_STATUSES,
    example: 'ACTIVE',
  })
  operationalStatus!: ConnectorOperationalStatus;

  createdAt!: Date;

  updatedAt!: Date;
}

export class ConnectorWithCurrentStatusResponseDto extends ConnectorResponseDto {
  @ApiProperty({
    enum: CONNECTOR_CURRENT_STATUSES,
    example: 'AVAILABLE',
  })
  currentStatus!: ConnectorCurrentStatus;
}
