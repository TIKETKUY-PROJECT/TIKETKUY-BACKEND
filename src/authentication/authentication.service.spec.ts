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
      isValidated: false,
    };

    testAccessToken = 'halo';
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
        },
        message: 'success',
      };

      const mockJwtSign = jest.spyOn(jwtService, 'sign');
      const mockBcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = mockBcryptCompare;
      mockJwtSign.mockImplementation((payload: any) => testAccessToken);
      prismaService.user.findFirst.mockResolvedValueOnce(testUser);
      const result = await authService.login(req);

      expect(result).toMatchObject(expectedRes);
      expect(mockJwtSign).toBeCalledTimes(1);
      expect(prismaService.user.findFirst).toBeCalledTimes(1);
      expect(mockBcryptCompare).toBeCalledTimes(1);
    });

    it('should return user is not registered error', async () => {
      const req: AuthRequest = {
        email: 'halo@gmail.com',
        password: 'halo',
      };
      prismaService.user.findFirst.mockResolvedValueOnce(null);
      try {
        await authService.login(req);
      } catch (e) {
        expect(e).toMatchObject(
          new UnauthorizedException('User is not registered!'),
        );
      }
      expect(prismaService.user.findFirst).toBeCalledTimes(1);
    });

    it('should return email or password is incorrect error', async () => {
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
      const mockConf = jest.spyOn(configService, 'get');
      mockConf.mockImplementationOnce(() => 'halo');
      const mockBcryptGenSalt = jest.fn().mockResolvedValue(12);
      (bcrypt.genSalt as jest.Mock) = mockBcryptGenSalt;
      const mockBcryptHash = jest.fn().mockResolvedValue('hashhh');
      (bcrypt.hash as jest.Mock) = mockBcryptHash;
      prismaService.user.create.mockResolvedValueOnce(testUser);

      const result = await authService.signUp(req);

      expect(result).toMatchObject(expectedRes);
      expect(mockBcryptGenSalt).toBeCalledTimes(1);
      expect(mockBcryptHash).toBeCalledTimes(1);
      expect(prismaService.user.create).toBeCalledTimes(1);
    });

    it('should throw email has been registered error', async () => {
      const dupReq: AuthRequest = {
        email: 'halo@gmail.com',
        password: 'halo',
      };
      const mockConf = jest.spyOn(configService, 'get');
      mockConf.mockImplementationOnce(() => 'halo');
      const mockBcryptGenSalt = jest.fn().mockResolvedValue(12);
      (bcrypt.genSalt as jest.Mock) = mockBcryptGenSalt;
      const mockBcryptHash = jest.fn().mockResolvedValue('hashhh');
      (bcrypt.hash as jest.Mock) = mockBcryptHash;
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
      expect(mockBcryptGenSalt).toBeCalledTimes(1);
      expect(mockBcryptHash).toBeCalledTimes(1);
      expect(prismaService.user.create).toBeCalledTimes(1);
    });
  });
});
