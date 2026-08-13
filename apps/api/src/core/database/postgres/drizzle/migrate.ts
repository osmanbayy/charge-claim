import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl)
    throw new Error(
      'DATABASE_URL environment variable is required to run migrations.',
    );

  const postgresClient = postgres(databaseUrl, {
    max: 1,
  });

  const database = drizzle(postgresClient);

  try {
    await migrate(database, {
      migrationsFolder: join(__dirname, 'migrations'),
    });

    console.log('Database migrations completed successfully.');
  } finally {
    await postgresClient.end();
  }
}

runMigrations().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Unknown migration error';

  console.error(`Database migration failed: ${message}`);
  process.exitCode = 1;
});
