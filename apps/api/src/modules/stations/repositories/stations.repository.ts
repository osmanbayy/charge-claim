import { Injectable } from '@nestjs/common';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import type {
  NewStationEntity,
  StationEntity,
  UpdateStationEntity,
} from '../entities/station.entity';
import { stations } from '../../../core/database/postgres/drizzle/schema';
import { asc, eq, sql } from 'drizzle-orm';

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

  async create(newStation: NewStationEntity): Promise<StationEntity> {
    const [createdStation] = await this.postgresDbService.database
      .insert(stations)
      .values(newStation)
      .returning();
    if (!createdStation) throw new Error('Station could not be created.');

    return createdStation;
  }

  async update(
    id: number,
    changes: UpdateStationEntity,
  ): Promise<StationEntity | null> {
    const [updatedStation] = await this.postgresDbService.database
      .update(stations)
      .set({
        ...changes,
        updatedAt: new Date(),
      })
      .where(eq(stations.id, id))
      .returning();

    return updatedStation ?? null;
  }

  findPage(page: number, limit: number): Promise<StationEntity[]> {
    const offset = (page - 1) * limit;

    return this.postgresDbService.database
      .select()
      .from(stations)
      .orderBy(asc(stations.name), asc(stations.id))
      .limit(limit)
      .offset(offset);
  }

  async count(): Promise<number> {
    const [result] = await this.postgresDbService.database
      .select({ count: sql<number>`COUNT(*)::integer` })
      .from(stations);

    return result.count ?? 0;
  }
}
