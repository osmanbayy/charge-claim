import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import type { UserEntity } from './entities/user.entity';

interface CreateDriverData {
  name: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalEmail = email.trim().toLowerCase();
    return this.usersRepository.findByEmail(normalEmail);
  }

  async createDriver(data: CreateDriverData): Promise<UserEntity> {
    const normalEmail = data.email.trim().toLowerCase();

    const existingDriver = await this.usersRepository.findByEmail(normalEmail);
    if (existingDriver)
      throw new ConflictException('Email is already registered.');

    return this.usersRepository.create({
      name: data.name,
      email: normalEmail,
      passwordHash: data.passwordHash,
      role: 'DRIVER',
    });
  }
}
