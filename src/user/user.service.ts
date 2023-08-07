import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserRequest, UserResponse } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getAllUser(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }

  async createUser(dto: CreateUserRequest): Promise<UserResponse | null> {
    let result: UserResponse;
    try {
      const user = await this.prismaService.user.create({
        data: { email: dto.email, password: dto.password },
      });
      result = {
        data: (({ id, createdAt, email }) => ({ id, createdAt, email }))(user),
        message: 'success',
      };
    } catch (e) {
      result = {
        data: null,
        message: 'failed',
      };
    }
    return result;
  }
}
