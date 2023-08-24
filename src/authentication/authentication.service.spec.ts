import { JwtService } from '@nestjs/jwt';
import { AuthenticationService } from './authentication.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { AuthRequest } from './dto';
import { CommonResponse } from 'src/common/dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let jwtService: JwtService;
  let prismaService: DeepMockProxy<PrismaClient>;
  let configService: ConfigService;
  let testUser: User;
  let testAccessToken: string;
  let testRefreshToken: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        JwtService,
        PrismaService,
        ConfigService,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    authService = module.get(AuthenticationService);
    jwtService = module.get(JwtService);
    prismaService = module.get(PrismaService);
    configService = module.get(ConfigService);

    testUser = {
      id: 1,
      createdAt: new Date(),
      email: 'test@gmail.com',
      password: 'test',
      role: 'USER',
      hashedRt: null,
    };

    testAccessToken = 'halo';
    testRefreshToken = 'halo';
  });

  describe('login', () => {
    it('should return access token when success', async () => {
      const req: AuthRequest = {
        email: 'halo@gmail.com',
        password: 'halo',
      };
      const expectedRes: CommonResponse = {
        data: {
          accessToken: testAccessToken,
          refreshToken: testRefreshToken,
        },
        message: 'success',
      };

      prismaService.user.findFirst.mockResolvedValueOnce(testUser);

      const mockBcryptCompare = jest.fn().mockResolvedValueOnce(true);
      (bcrypt.compare as jest.Mock) = mockBcryptCompare;

      const mockGenerateTokenService = jest.spyOn(
        authService,
        'generateTokens',
      );
      mockGenerateTokenService.mockResolvedValueOnce({
        accessToken: testAccessToken,
        refreshToken: testRefreshToken,
      });

      const mockUpdateUserRtService = jest.spyOn(authService, 'updateRt');
      mockUpdateUserRtService.mockImplementationOnce(async () =>
        Promise.resolve(),
      );

      const result = await authService.login(req);

      expect(result).toMatchObject(expectedRes);
      expect(mockGenerateTokenService).toBeCalledTimes(1);
      expect(mockUpdateUserRtService).toBeCalledTimes(1);
      expect(prismaService.user.findFirst).toBeCalledTimes(1);
      expect(mockBcryptCompare).toBeCalledTimes(1);
    });

    it('should return email or password is incorrect error when user not found', async () => {
      const req: AuthRequest = {
        email: 'halo@gmail.com',
        password: 'halo',
      };
      prismaService.user.findFirst.mockResolvedValueOnce(null);
      try {
        await authService.login(req);
      } catch (e) {
        expect(e).toMatchObject(
          new UnauthorizedException('Email or password is incorrect!'),
        );
      }
      expect(prismaService.user.findFirst).toBeCalledTimes(1);
    });

    it('should return email or password is incorrect error when password incorrect', async () => {
      const req: AuthRequest = {
        email: 'halo@gmail.com',
        password: 'halo',
      };
      prismaService.user.findFirst.mockResolvedValueOnce(testUser);
      const mockBcryptCompare = jest.fn().mockResolvedValue(false);
      (bcrypt.compare as jest.Mock) = mockBcryptCompare;
      try {
        await authService.login(req);
      } catch (e) {
        expect(e).toMatchObject(
          new UnauthorizedException('Email or password is incorrect!'),
        );
      }
      expect(prismaService.user.findFirst).toBeCalledTimes(1);
      expect(mockBcryptCompare).toBeCalledTimes(1);
    });
  });

  describe('signup', () => {
    it('should return user without password when success', async () => {
      const req: AuthRequest = {
        email: 'halo@gmail.com',
        password: 'halo',
      };
      const expectedRes: CommonResponse = {
        data: {
          id: testUser.id,
          createdAt: testUser.createdAt,
          email: testUser.email,
        },
        message: 'success',
      };

      const mockHashDataService = jest.spyOn(authService, 'hashData');
      mockHashDataService.mockResolvedValueOnce('hashed of halo');

      prismaService.user.create.mockResolvedValueOnce(testUser);

      const result = await authService.signUp(req);

      expect(result).toMatchObject(expectedRes);
      expect(mockHashDataService).toBeCalledTimes(1);
      expect(prismaService.user.create).toBeCalledTimes(1);
    });

    it('should throw email has been registered error', async () => {
      const dupReq: AuthRequest = {
        email: 'halo@gmail.com',
        password: 'halo',
      };

      const mockHashDataService = jest.spyOn(authService, 'hashData');
      mockHashDataService.mockResolvedValueOnce('hashed of halo');

      prismaService.user.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('failed', {
          code: 'P2002',
          clientVersion: '5.1.1',
        }),
      );
      try {
        await authService.signUp(dupReq);
      } catch (e) {
        expect(e).toMatchObject(
          new UnauthorizedException('Email has been registered!'),
        );
      }
      expect(mockHashDataService).toBeCalledTimes(1);
      expect(prismaService.user.create).toBeCalledTimes(1);
    });
  });
});
