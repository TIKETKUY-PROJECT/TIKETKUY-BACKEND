import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CommonResponse } from 'src/common/dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: AuthRequest) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new UnauthorizedException('User is not registered!');
    if (!(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Email or password is incorrect!');
    const result: CommonResponse = {
      data: {
        accessToken: await this.jwtService.sign({
          id: user.id,
          createdAt: user.createdAt,
          email: user.email,
        }),
      },
      message: 'success',
    };
    return result;
  }

  async signUp(dto: AuthRequest) {
    try {
      const salt = await bcrypt.genSalt(this.configService.get('SALT_ROUNDS'));
      const hashedPassword = await bcrypt.hash(dto.password, salt);
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      });
      const result: CommonResponse = {
        data: {
          id: user.id,
          createdAt: user.createdAt,
          email: user.email,
        },
        message: 'success',
      };
      return result;
    } catch (e) {
      throw e;
    }
  }
}
