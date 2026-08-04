import 'reflect-metadata';
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import appConfig from './src/core/config/app.config';

const config = appConfig();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/core/database/postgres/drizzle/schema/*.schema.ts',
  out: './src/core/database/postgres/drizzle/migrations',
  dbCredentials: {
    url: config.database.postgresUrl,
  },
  strict: true,
  verbose: true,
});
