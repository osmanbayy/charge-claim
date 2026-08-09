import { BadRequestException, Injectable } from '@nestjs/common';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { AvailabilityRepository } from './repositories/availability.repository';
import type {
  AvailabilityResponseDto,
  AvailableStationResponseDto,
} from './dto/availabilty-response.dto';
import {
  MILLISECONDS_PER_MINUTE,
  RESERVATION_DURATION_MINUTES,
} from '../../common/constants';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async getAvailability(
    queryDto: AvailabilityQueryDto,
  ): Promise<AvailabilityResponseDto> {
    const { startAt, endAt } = this.validateRange(queryDto);

    const rows = await this.availabilityRepository.findAvailableInRange(
      startAt,
      endAt,
      {
        district: queryDto.district?.trim(),
        connectorType: queryDto.connectorType,
        minPowerKw: queryDto.minPowerKw,
      },
    );

    // grouping stations
    const stationMap = new Map<number, AvailableStationResponseDto>();

    for (const row of rows) {
      const connector = {
        id: row.connector.id,
        code: row.connector.code,
        type: row.connector.type,
        powerKw: row.connector.powerKw,
        pricePerKWh: row.connector.pricePerKWh,
      };

      const existingStation = stationMap.get(row.station.id);

      if (existingStation !== undefined) {
        existingStation.connectors.push(connector);
        continue;
      }

      stationMap.set(row.station.id, {
        id: row.station.id,
        name: row.station.name,
        district: row.station.district,
        address: row.station.address,
        latitude: row.station.latitude,
        longitude: row.station.longitude,
        connectors: [connector],
      });
    }

    // converting to array
    const stations = Array.from(stationMap.values());

    return {
      range: {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      },
      summary: {
        availableStationCount: stations.length,
        availableConnectorCount: rows.length,
      },
      stations,
    };
  }

  validateRange(queryDto: AvailabilityQueryDto): {
    startAt: Date;
    endAt: Date;
  } {
    const startAt = new Date(queryDto.startAt);
    const endAt = new Date(queryDto.endAt);

    // startAt in the future?
    if (startAt.getTime() <= Date.now())
      throw new BadRequestException(
        'Availability start time must be in the future.',
      );

    // does endAt come after the startAt?
    if (endAt.getTime() <= startAt.getTime())
      throw new BadRequestException(
        'Availability end time mustbe after start time',
      );

    // startAt exactly on the 00 or 30
    const startsOnThirtyMinuteBoundary =
      (startAt.getUTCMinutes() === 0 || startAt.getUTCMinutes() === 30) &&
      startAt.getUTCSeconds() === 0 &&
      startAt.getUTCMilliseconds() === 0;
    if (!startsOnThirtyMinuteBoundary)
      throw new BadRequestException(
        'Availability start time must be on a 30-minute boundary',
      );

    const durationMinutes =
      (endAt.getTime() - startAt.getTime()) / MILLISECONDS_PER_MINUTE;

    const hasAllowedDuration = RESERVATION_DURATION_MINUTES.some(
      (allowedDuration) => allowedDuration === durationMinutes,
    );
    if (!hasAllowedDuration)
      throw new BadRequestException(
        'Availability duration must be 30, 60, 90, or 120 minutes.',
      );

    return { startAt, endAt };
  }
}
