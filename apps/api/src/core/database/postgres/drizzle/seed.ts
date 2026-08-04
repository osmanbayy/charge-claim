import 'reflect-metadata';
import 'dotenv/config';
import appConfig from '../../../config/app.config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { hash } from 'bcryptjs';
import { Logger } from '@nestjs/common';
import {
  connectorStationPlan,
  connectorTemplates,
  stationSeedData,
} from '../../../../common/constants';

const logger = new Logger('DatabaseSeed');

async function runSeed(): Promise<void> {
  const config = appConfig();
  const client = postgres(config.database.postgresUrl, { max: 1 });
  const database = drizzle(client, { schema });

  try {
    const [driverPasswordHash, staffPasswordHash] = await Promise.all([
      hash('Driver123*', 12),
      hash('Staff123*', 12),
    ]);

    const insertedUsers = await database
      .insert(schema.users)
      .values([
        {
          name: 'Demo Driver',
          email: 'driver@chargeclaim.dev',
          passwordHash: driverPasswordHash,
          role: 'DRIVER',
        },
        {
          name: 'Demo Staff',
          email: 'staff@chargeclaim.dev',
          passwordHash: staffPasswordHash,
          role: 'STAFF',
        },
      ])
      .onConflictDoNothing({
        target: schema.users.email,
      })
      .returning({
        id: schema.users.id,
      });

    logger.log(`Demo users ready. Inserted: ${insertedUsers.length}`);

    //! add station
    const existingStations = await database
      .select({
        name: schema.stations.name,
      })
      .from(schema.stations);

    const existingStationNames = new Set(
      existingStations.map((station) => station.name),
    );
    const missingStations = stationSeedData.filter(
      (station) => !existingStationNames.has(station.name),
    );
    if (missingStations.length > 0) {
      await database.insert(schema.stations).values(missingStations);
    }

    logger.log(`Stations ready. Inserted: ${missingStations.length}`);

    //! add connector
    const persistedStations = await database
      .select({
        id: schema.stations.id,
        name: schema.stations.name,
      })
      .from(schema.stations);

    const stationIdByName = new Map(
      persistedStations.map((station) => [station.name, station.id]),
    );

    const connectorSeedData = connectorStationPlan.flatMap(
      ({ stationName, connectorCount }) => {
        const stationId = stationIdByName.get(stationName);

        if (stationId === undefined) {
          throw new Error(`Seed station not found: ${stationName}`);
        }

        return connectorTemplates.slice(0, connectorCount).map((connector) => ({
          stationId,
          code: connector.code,
          type: connector.type,
          powerKw: connector.powerKw,
          pricePerKWh: connector.pricePerKWh,
        }));
      },
    );

    const insertedConnectors = await database
      .insert(schema.connectors)
      .values(connectorSeedData)
      .onConflictDoNothing({
        target: [schema.connectors.stationId, schema.connectors.code],
      })
      .returning({
        id: schema.connectors.id,
      });

    logger.log(`Connectors ready. Inserted: ${insertedConnectors.length}`);
  } finally {
    await client.end();
  }
}

void runSeed().catch((error: unknown) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  logger.error(message);
  process.exitCode = 1;
});
