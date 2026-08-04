import { Injectable } from '@nestjs/common';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import type { StationEntity } from '../entities/station.entity';
import { stations } from '../../../core/database/postgres/drizzle/schema';
import { asc, eq } from 'drizzle-orm';

@Injectable()
export class StationsRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  findAll(): Promise<StationEntity[]> {
    return this.postgresDbService.database
      .select()
      .from(stations)
      .orderBy(asc(stations.name));
  }

  async findById(id: number): Promise<StationEntity | null> {
    const [station] = await this.postgresDbService.database
      .select()
      .from(stations)
      .where(eq(stations.id, id))
      .limit(1);

    return station ?? null;
  }
}
