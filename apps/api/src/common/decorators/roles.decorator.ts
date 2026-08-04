import { SetMetadata } from '@nestjs/common';
import type { UserEntity } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserEntity['role'][]) =>
  SetMetadata(ROLES_KEY, roles);
