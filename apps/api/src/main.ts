import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

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
    origin: 'http://localhost:3000',
  });

  app.setGlobalPrefix('api');

  await app.listen(3001);

  const appUrl = await app.getUrl();
  logger.log(`Application is running on: ${appUrl}/api`);
}
void bootstrap();
