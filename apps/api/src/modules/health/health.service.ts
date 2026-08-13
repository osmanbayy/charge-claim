import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Queue } from 'bullmq';
import {
  RESERVATION_NO_SHOW_QUEUE,
  type ReservationNoShowJobData,
} from '../../common/queues/reservation-no-show.queue';
import { PostgresDatabaseService } from '../../core/database/postgres/postgres-database.service';
import type {
  DependencyHealth,
  HealthResponse,
} from './entities/health.entity';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly postgresDbService: PostgresDatabaseService,

    @InjectQueue(RESERVATION_NO_SHOW_QUEUE)
    private readonly healthQueue: Queue<ReservationNoShowJobData>,
  ) {}

  async check(): Promise<HealthResponse> {
    const [postgres, redis] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ]);

    const status =
      postgres.status === 'ok' && redis.status === 'ok' ? 'ok' : 'error';

    return {
      status,
      timestamp: new Date().toISOString(),
      dependencies: {
        postgres,
        redis,
      },
    };
  }

  private async checkPostgres(): Promise<DependencyHealth> {
    try {
      await this.postgresDbService.database.execute(sql`SELECT 1`);

      return {
        status: 'ok',
      };
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error('PostgreSQL health check failed.', errorStack);

      return {
        status: 'error',
      };
    }
  }

  private async checkRedis(): Promise<DependencyHealth> {
    try {
      await this.healthQueue.getJobCounts(
        'waiting',
        'active',
        'delayed',
        'failed',
      );

      return {
        status: 'ok',
      };
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error('Redis health check failed.', errorStack);

      return {
        status: 'error',
      };
    }
  }
}
