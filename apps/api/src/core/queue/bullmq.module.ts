import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigModule } from '../config/app-config.module';
import { AppConfigService } from '../config/app-config.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],

      useFactory: (config: AppConfigService) => {
        const redisUrl = new URL(config.redis.url);

        return {
          connection: {
            host: redisUrl.hostname,
            port: redisUrl.port ? Number(redisUrl.port) : 6379,
            username: redisUrl.username || undefined,
            password: redisUrl.password || undefined,
          },

          prefix: 'charge-claim',
        };
      },
    }),
  ],
})
export class BullMqModule {}
