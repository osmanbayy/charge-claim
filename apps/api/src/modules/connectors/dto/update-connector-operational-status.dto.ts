import { IsIn } from 'class-validator';
import {
  CONNECTOR_OPERATIONAL_STATUSES,
  type ConnectorOperationalStatus,
} from '../../../core/database/postgres/drizzle/schema/connectors.schema';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConnectorOperationalStatusDto {
  @ApiProperty({
    description: 'Operational status of the connector.',
    enum: CONNECTOR_OPERATIONAL_STATUSES,
    example: 'MAINTENANCE',
  })
  @IsIn(CONNECTOR_OPERATIONAL_STATUSES)
  operationalStatus!: ConnectorOperationalStatus;
}
