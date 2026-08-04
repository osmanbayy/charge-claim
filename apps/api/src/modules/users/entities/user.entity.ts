import { users } from '../../../core/database/postgres/drizzle/schema';

export type UserEntity = typeof users.$inferSelect;
export type NewUserEntity = typeof users.$inferInsert;

export type PublicUserEntity = Omit<UserEntity, 'passwordHash'>;
