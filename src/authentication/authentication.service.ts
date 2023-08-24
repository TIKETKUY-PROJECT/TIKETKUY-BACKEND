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
import { User } from '@prisma/client';

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
    if (!user || !(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Email or password is incorrect!');
    const { accessToken: at, refreshToken: rt } = await this.generateTokens(
      user,
    );
    await this.updateRt(user, rt);
    const result: CommonResponse = {
      data: {
        accessToken: at,
        refreshToken: rt,
      },
      message: 'success',
    };
    return result;
  }

  async signUp(dto: AuthRequest) {
    try {
      const hashedPassword = await this.hashData(dto.password);
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
      throw new UnauthorizedException('Email has been registered!');
    }
  }

  async logout(userId: number) {
    try {
      await this.prismaService.user.updateMany({
        where: {
          id: userId,
          hashedRt: {
            not: null,
          },
        },
        data: {
          hashedRt: null,
        },
      });
      const result: CommonResponse = {
        data: null,
        message: 'success',
      };
      return result;
    } catch (e) {
      throw new BadRequestException('unable to logout');
    }
  }

  async refresh(userId: number, rt: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRt || !(await bcrypt.compare(rt, user.hashedRt)))
      throw new UnauthorizedException('Access Denied');
    const { accessToken: newAt, refreshToken: newRt } =
      await this.generateTokens(user);
    await this.updateRt(user, newRt);
    const result: CommonResponse = {
      data: {
        accessToken: newAt,
        refreshToken: newRt,
      },
      message: 'success',
    };
    return result;
  }

  async updateRt(user: User, refreshToken: string) {
    const hashedRt = await this.hashData(refreshToken);
    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedRt: hashedRt,
      },
    });
  }

  async generateTokens(user: User) {
    const accessToken = await this.jwtService.sign({
      id: user.id,
      createdAt: user.createdAt,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await this.jwtService.sign(
      {
        id: user.id,
        createdAt: user.createdAt,
        email: user.email,
        role: user.role,
      },
      { secret: this.configService.get('RT_SECRET'), expiresIn: '7d' },
    );
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async hashData(data: any) {
    const salt = await bcrypt.genSalt(
      Number(this.configService.get('SALT_ROUNDS')),
    );
    const hashedData = await bcrypt.hash(data, salt);
    return hashedData;
  }
}
