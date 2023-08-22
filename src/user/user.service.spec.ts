import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { CreateUserRequest, UserResponse } from './dto';

describe('UserService', () => {
  let service: UserService;
  let prisma: DeepMockProxy<PrismaClient>;
  let testUser: User;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
    testUser = {
      id: 1,
      createdAt: new Date(),
      email: 'test@gmail.com',
      password: 'test',
      isValidated: false,
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUser', () => {
    it('should return array of users', async () => {
      const users: User[] = [testUser];
      prisma.user.findMany.mockResolvedValueOnce(users);
      const result = await service.findAllUser();
      expect(result).toEqual(users);
      expect(result).toHaveLength(1);
      expect(prisma.user.findMany).toBeCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should return user', async () => {
      const createUserDto: CreateUserRequest = {
        email: 'test@gmail.com',
        password: 'test',
      };
      const createdUser: User = { ...testUser, ...createUserDto };

      prisma.user.create.mockResolvedValueOnce(createdUser);
      const result = await service.createUser(createUserDto);
      expect(result).toMatchObject<UserResponse>({
        data: (({ id, createdAt, email }) => ({ id, createdAt, email }))(
          createdUser,
        ),
        message: 'success',
      });
      expect(prisma.user.create).toBeCalledTimes(1);
    });

    it('should throw error', async () => {
      const duplicatedUserDto: CreateUserRequest = {
        email: 'test@gmail.com',
        password: 'test',
      };
      prisma.user.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('failed', {
          code: 'P2002',
          clientVersion: '5.1.1',
        }),
      );
      const result = await service.createUser(duplicatedUserDto);
      expect(result).toMatchObject<UserResponse>({
        data: null,
        message: 'failed',
      });
      expect(prisma.user.create).toBeCalledTimes(1);
    });
  });
});
