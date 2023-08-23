import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserRequest } from './dto';
import { CommonResponse } from 'src/common/dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findAllUser() {
    const result: CommonResponse = {
      data: await this.prismaService.user.findMany(),
      message: 'success',
    };
    return result;
  }

  async createUser(dto: CreateUserRequest) {
    let result: CommonResponse;
    try {
      const user = await this.prismaService.user.create({
        data: { email: dto.email, password: dto.password },
      });
      result = {
        data: (({ id, createdAt, email }) => ({ id, createdAt, email }))(user),
        message: 'success',
      };
    } catch (e) {
      throw new BadRequestException('credentials have been taken!');
    }
    return result;
  }
}
