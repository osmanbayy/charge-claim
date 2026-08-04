import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/app-config.module';
import { PostgresDatabaseModule } from './core/database/postgres/postgres-database.module';
import { AuthModule } from './modules/auth/auth.module';
import { StationsModule } from './modules/stations/stations.module';

@Module({
  imports: [
    AppConfigModule,
    PostgresDatabaseModule,
    AuthModule,
    StationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
