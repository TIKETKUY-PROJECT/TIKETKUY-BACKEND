import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { LoginRequest } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  constructor(private prismaService: PrismaService) {}

  async login(dto: LoginRequest): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new UnauthorizedException('User is not registered!');
    if (!(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Email or password is incorrect!');
    return null;
  }
}
