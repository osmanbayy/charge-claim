import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { connectors } from './connectors.schema';

export const RESERVATION_STATUSES = [
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];
export const reservationStatusEnum = pgEnum(
  'reservation_status',
  RESERVATION_STATUSES,
);

export const reservations = pgTable(
  'reservations',
  {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),

    connectorId: integer('connector_id')
      .notNull()
      .references(() => connectors.id, { onDelete: 'restrict' }),

    startAt: timestamp('start_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),

    endAt: timestamp('end_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),

    noShowDeadlineAt: timestamp('no_show_deadline_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),

    status: reservationStatusEnum('status').default('CONFIRMED').notNull(),

    cancelledAt: timestamp('cancelled_at', {
      withTimezone: true,
      mode: 'date',
    }),

    noShowEmailSentAt: timestamp('no_show_email_sent_at', {
      withTimezone: true,
      mode: 'date',
    }),

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
      'reservation_end_at_after_start_at_check',
      sql`${table.endAt} > ${table.startAt}`,
    ),
    index('reservations_user_id_start_at_index').on(
      table.userId,
      table.startAt,
    ),
    index('reservations_connector_id_start_at_index').on(
      table.connectorId,
      table.startAt,
    ),
    index('reservations_status_no_show_deadline_index').on(
      table.status,
      table.noShowDeadlineAt,
    ),
  ],
);
