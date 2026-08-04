import { stations } from '../../../core/database/postgres/drizzle/schema';

export type StationEntity = typeof stations.$inferSelect;
export type NewStationEntity = typeof stations.$inferInsert;
