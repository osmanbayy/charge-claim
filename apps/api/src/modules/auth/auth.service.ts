import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PasswordHasherService } from './password-hasher.service';
import type { PublicUserEntity } from '../users/entities/user.entity';
import type { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
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
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password.');

    const passwordIsCorrect = await this.passwordHasher.verifyPassword(
      loginDto.password,
      user.passwordHash,
    );
    if (!passwordIsCorrect)
      throw new UnauthorizedException('Invalid email or password');

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  async getCurrentUser(userId: number): Promise<PublicUserEntity> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

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
