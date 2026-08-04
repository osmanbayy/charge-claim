import type { UserEntity } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: number;
  role: UserEntity['role'];
}
