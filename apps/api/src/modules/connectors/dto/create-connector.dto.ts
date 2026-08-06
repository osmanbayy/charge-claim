import { IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  CONNECTOR_TYPES,
  type ConnectorType,
} from '../../../core/database/postgres/drizzle/schema/connectors.schema';

export class CreateConnectorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/\S/, {
    message: 'code must contain at least one non-whitespace character',
  })
  code!: string;

  @IsIn(CONNECTOR_TYPES)
  type!: ConnectorType;

  @IsString()
  @Matches(/^(?!0+(?:\.0{1,2})?$)\d{1,4}(?:\.\d{1,2})?$/, {
    message:
      'powerKw must be a positive decimal with at most 4 integer and 2 decimal digits',
  })
  powerKw!: string;

  @IsString()
  @Matches(/^(?!0+(?:\.0{1,2})?$)\d{1,8}(?:\.\d{1,2})?$/, {
    message:
      'pricePerKWh must be a positive decimal with at most 8 integer and 2 decimal digits',
  })
  pricePerKWh!: string;
}
