import { IsIn } from 'class-validator';
import {
  CONNECTOR_OPERATIONAL_STATUSES,
  type ConnectorOperationalStatus,
} from '../../../core/database/postgres/drizzle/schema/connectors.schema';

export class UpdateConnectorOperationalStatusDto {
  @IsIn(CONNECTOR_OPERATIONAL_STATUSES)
  operationalStatus!: ConnectorOperationalStatus;
}
