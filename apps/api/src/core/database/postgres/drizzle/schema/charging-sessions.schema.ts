import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { connectors } from './connectors.schema';
import { reservations } from './reservations.schema';

export const CHARGING_SESSION_STATUSES = ['ACTIVE', 'COMPLETED'] as const;
export type ChargingSessionStatus = (typeof CHARGING_SESSION_STATUSES)[number];
export const chargingSessionStatusEnum = pgEnum(
  'charging_session_status',
  CHARGING_SESSION_STATUSES,
);

export const CHARGING_SESSION_END_REASONS = [
  'USER_STOPPED',
  'TIME_LIMIT_REACHED',
] as const;
export type ChargingSessionEndReason =
  (typeof CHARGING_SESSION_END_REASONS)[number];
export const chargingSessionEndReasonEnum = pgEnum(
  'charging_session_end_reason',
  CHARGING_SESSION_END_REASONS,
);

export const chargingSessions = pgTable(
  'charging_sessions',
  {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),

    connectorId: integer('connector_id')
      .notNull()
      .references(() => connectors.id, { onDelete: 'restrict' }),

    reservationId: integer('reservation_id')
      .references(() => reservations.id, { onDelete: 'restrict' })
      .unique(),

    status: chargingSessionStatusEnum('status').default('ACTIVE').notNull(),

    startedAt: timestamp('started_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),

    plannedEndAt: timestamp('planned_end_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),

    endedAt: timestamp('ended_at', {
      withTimezone: true,
      mode: 'date',
    }),

    powerKwSnapshot: numeric('power_kw_snapshot', {
      precision: 6,
      scale: 2,
    }).notNull(),

    pricePerKWhSnapshot: numeric('price_per_kwh_snapshot', {
      precision: 10,
      scale: 2,
    }).notNull(),

    energyKWh: numeric('energy_kwh', {
      precision: 10,
      scale: 3,
    }),

    totalAmount: numeric('total_amount', {
      precision: 12,
      scale: 2,
    }),

    endReason: chargingSessionEndReasonEnum('end_reason'),

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
    // end time must be greater than start date
    check(
      'charging_sessions_planned_end_after_start_check',
      sql`${table.plannedEndAt} > ${table.startedAt}`,
    ),
    // same connector can be only one active session at the same time
    uniqueIndex('charging_sessions_active_connector_unique')
      .on(table.connectorId)
      .where(sql`${table.status} = 'ACTIVE'`),
    // same user can start only one active session at the same time
    uniqueIndex('charging_sessions_active_user_unique')
      .on(table.userId)
      .where(sql`${table.status} = 'ACTIVE'`),
    index('charging_sessions_user_id_started_at_index').on(
      table.userId,
      table.startedAt,
    ),
    index('charging_sessions_status_planned_end_at_index').on(
      table.status,
      table.plannedEndAt,
    ),
  ],
);
