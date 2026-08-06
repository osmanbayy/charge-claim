import { ApiProperty } from '@nestjs/swagger';
import { ConnectorWithCurrentStatusResponseDto } from '../../connectors/dto/connector-response.dto';

export class StationResponseDto {
  id!: number;

  name!: string;

  district!: string;

  address!: string;

  latitude!: number;

  longitude!: number;

  createdAt!: Date;

  updatedAt!: Date;
}

export class StationWithConnectorsResponseDto extends StationResponseDto {
  @ApiProperty({
    type: () => ConnectorWithCurrentStatusResponseDto,
    isArray: true,
  })
  connectors!: ConnectorWithCurrentStatusResponseDto[];
}
