import 'reflect-metadata';
import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  connectorStationPlan,
  connectorTemplates,
  stationSeedData,
} from '../../../../common/constants';
import appConfig from '../../../config/app.config';
import * as schema from './schema';

const logger = new Logger('ProductionDatabaseSeed');

async function runProductionSeed(): Promise<void> {
  const config = appConfig();
  const postgresClient = postgres(config.database.postgresUrl, {
    max: 1,
  });

  const database = drizzle(postgresClient, {
    schema,
  });

  try {
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

    logger.log(`Stations inserted: ${missingStations.length}`);

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
          throw new Error(`Production seed station not found: ${stationName}`);
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

    logger.log(`Connectors inserted: ${insertedConnectors.length}`);
    logger.log('Production seed completed successfully.');
  } finally {
    await postgresClient.end();
  }
}

runProductionSeed().catch((error: unknown) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  logger.error(message);
  process.exitCode = 1;
});
