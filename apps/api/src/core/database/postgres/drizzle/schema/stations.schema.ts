import { sql } from 'drizzle-orm';
import {
  check,
  doublePrecision,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const stations = pgTable(
  'stations',
  {
    id: serial('id').primaryKey(),

    name: varchar('name', {
      length: 150,
    }).notNull(),

    district: varchar('district', {
      length: 50,
    }).notNull(),

    address: varchar('address', {
      length: 255,
    }).notNull(),

    latitude: doublePrecision('latitude').notNull(),

    longitude: doublePrecision('longitude').notNull(),

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
    check(
      'stations_latitude_range_check',
      sql`${table.latitude} BETWEEN -90 AND 90`,
    ),
    check(
      'stations_longitude_range_check',
      sql`${table.longitude} BETWEEN -180 AND 180`,
    ),
  ],
);
