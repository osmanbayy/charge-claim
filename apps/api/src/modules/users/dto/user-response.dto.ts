import { ApiProperty } from '@nestjs/swagger';
import {
  USER_ROLES,
  type UserRole,
} from '../../../core/database/postgres/drizzle/schema/users.schema';

export class UserResponseDto {
  id!: number;

  name!: string;

  email!: string;

  @ApiProperty({
    enum: USER_ROLES,
    example: 'DRIVER',
  })
  role!: UserRole;

  createdAt!: Date;

  updatedAt!: Date;
}
