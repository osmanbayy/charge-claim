import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './app.config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  get nodeEnv(): AppConfig['server']['nodeEnv'] {
    return this.configService.getOrThrow('server.nodeEnv', {
      infer: true,
    });
  }

  get port(): number {
    return this.configService.getOrThrow('server.port', {
      infer: true,
    });
  }

  get frontendUrl(): string {
    return this.configService.getOrThrow('server.frontendUrl', {
      infer: true,
    });
  }

  get database(): AppConfig['database'] {
    return this.configService.getOrThrow('database', {
      infer: true,
    });
  }

  get redis(): AppConfig['redis'] {
    return this.configService.getOrThrow('redis', {
      infer: true,
    });
  }

  get jwt(): AppConfig['jwt'] {
    return this.configService.getOrThrow('jwt', {
      infer: true,
    });
  }

  get mail(): AppConfig['mail'] {
    return this.configService.getOrThrow('mail', {
      infer: true,
    });
  }

  get jobs(): AppConfig['jobs'] {
    return this.configService.getOrThrow('jobs', {
      infer: true,
    });
  }
}
