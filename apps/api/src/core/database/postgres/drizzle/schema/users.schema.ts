import {
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const USER_ROLES = ['DRIVER', 'STAFF'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const userRoleEnum = pgEnum('user_role', USER_ROLES);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  name: varchar('name', {
    length: 100,
  }).notNull(),

  email: varchar('email', {
    length: 255,
  })
    .notNull()
    .unique(),

  passwordHash: varchar('password_hash', {
    length: 255,
  }).notNull(),

  role: userRoleEnum('role').default('DRIVER').notNull(),

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
});
