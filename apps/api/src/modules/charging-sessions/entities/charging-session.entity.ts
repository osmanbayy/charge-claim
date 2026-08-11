import { chargingSessions } from '../../../core/database/postgres/drizzle/schema';

export type ChargingSessionEntity = typeof chargingSessions.$inferSelect;

export type NewChargingSessionEntity = typeof chargingSessions.$inferInsert;
