import { Injectable } from '@nestjs/common';
import { PostgresDatabaseService } from '../../../core/database/postgres/postgres-database.service';
import type { NewUserEntity, UserEntity } from '../entities/user.entity';
import { users } from '../../../core/database/postgres/drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersRepository {
  constructor(private readonly postgresDbService: PostgresDatabaseService) {}

  async findById(id: number): Promise<UserEntity | null> {
    const [user] = await this.postgresDbService.database
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const [user] = await this.postgresDbService.database
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async create(newUser: NewUserEntity): Promise<UserEntity> {
    const [createdUser] = await this.postgresDbService.database
      .insert(users)
      .values(newUser)
      .returning();
    if (!createdUser) throw new Error('User could not be created.');

    return createdUser;
  }
}
