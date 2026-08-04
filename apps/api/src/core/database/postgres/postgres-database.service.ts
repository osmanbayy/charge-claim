import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as schema from './drizzle/schema';
import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AppConfigService } from '../../config/app-config.service';
import { sql } from 'drizzle-orm';

@Injectable()
export class PostgresDatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresDatabaseService.name);
  private readonly client: ReturnType<typeof postgres>;
  readonly database: PostgresJsDatabase<typeof schema>;

  constructor(config: AppConfigService) {
    this.client = postgres(config.database.postgresUrl);
    this.database = drizzle(this.client, { schema });
  }

  async onModuleInit(): Promise<void> {
    await this.database.execute(sql`SELECT 1;`);
    this.logger.log('PostgreSQL Connection established.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.end();
  }
}
