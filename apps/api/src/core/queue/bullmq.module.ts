import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigModule } from '../config/app-config.module';
import { AppConfigService } from '../config/app-config.service';
import { RESERVATION_NO_SHOW_QUEUE } from '../../common/queues/reservation-no-show.queue';
import { CHARGING_SESSION_COMPLETION_QUEUE } from '../../common/queues/charging-session-completion.queue';

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

    BullModule.registerQueue({
      name: RESERVATION_NO_SHOW_QUEUE,
    }),

    BullModule.registerQueue({
      name: CHARGING_SESSION_COMPLETION_QUEUE,
    }),
  ],
  exports: [BullModule],
})
export class BullMqModule {}
