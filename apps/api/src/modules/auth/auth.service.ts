import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PasswordHasherService } from './password-hasher.service';
import type { PublicUserEntity } from '../users/entities/user.entity';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async register(registerDto: RegisterDto): Promise<PublicUserEntity> {
    const passwordHash = await this.passwordHasher.hashPassword(
      registerDto.password,
    );

    const user = await this.usersService.createDriver({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
