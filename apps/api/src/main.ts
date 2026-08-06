import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { AppConfigService } from './core/config/app-config.service';
import { configureSwagger } from './core/swagger/swagger.config';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // ctrl + c -> close postgresql connection
  app.enableShutdownHooks();

  const config = app.get(AppConfigService);

  // global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // control the validation of incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // cors configuration
  app.enableCors({
    origin: config.frontendUrl,
  });

  app.setGlobalPrefix('api');

  configureSwagger(app);

  await app.listen(config.port);

  const appUrl = await app.getUrl();
  logger.log(`Application is running on: ${appUrl}/api`);
}
void bootstrap();
