import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { stations } from './stations.schema';

export const CONNECTOR_TYPES = ['TYPE_2', 'CCS2'] as const;
export type ConnectorType = (typeof CONNECTOR_TYPES)[number];
export const connectorTypeEnum = pgEnum('connector_type', CONNECTOR_TYPES);

export const CONNECTOR_OPERATIONAL_STATUSES = [
  'ACTIVE',
  'MAINTENANCE',
] as const;
export type ConnectorOperationalStatus =
  (typeof CONNECTOR_OPERATIONAL_STATUSES)[number];
export const connectorOperationalStatusEnum = pgEnum(
  'connector_operational_status',
  CONNECTOR_OPERATIONAL_STATUSES,
);

export const CONNECTOR_CURRENT_STATUSES = [
  'MAINTENANCE',
  'OCCUPIED',
  'RESERVED',
  'AVAILABLE',
] as const;
export type ConnectorCurrentStatus =
  (typeof CONNECTOR_CURRENT_STATUSES)[number];

export const connectors = pgTable(
  'connectors',
  {
    id: serial('id').primaryKey(),

    stationId: integer('station_id')
      .notNull()
      .references(() => stations.id, { onDelete: 'restrict' }),

    code: varchar('code', {
      length: 20,
    }).notNull(),

    type: connectorTypeEnum('type').notNull(),

    powerKw: numeric('power_kw', {
      precision: 6,
      scale: 2,
    }).notNull(),

    pricePerKWh: numeric('price_per_kwh', {
      precision: 10,
      scale: 2,
    }).notNull(),

    operationalStatus: connectorOperationalStatusEnum('operational_status')
      .default('ACTIVE')
      .notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('connectors_station_id_code_unique').on(
      table.stationId,
      table.code,
    ),
    check('connectors_power_kwh_positive_check', sql`${table.powerKw} > 0`),
    check(
      'connectors_price_per_kwh_positive_check',
      sql`${table.pricePerKWh} > 0`,
    ),
  ],
);
