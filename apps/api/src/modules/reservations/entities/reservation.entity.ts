import { reservations } from '../../../core/database/postgres/drizzle/schema';

export type ReservationEntity = typeof reservations.$inferSelect;

export type NewReservationEntity = typeof reservations.$inferInsert;
