import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '@modules/prisma';
import { User } from '@prisma/client';
import { CommonResponse } from '@modules/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let testUser: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService],
    }).compile();
    controller = module.get(UserController);
    service = module.get(UserService);

    testUser = {
      id: 1,
      createdAt: new Date(),
      email: 'test@gmail.com',
      password: 'test',
      role: 'USER',
      hashedRt: null,
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return empty list', async () => {
      const expectedRes: CommonResponse = {
        data: [testUser],
        message: 'success',
      };
      const mockFunction = jest
        .spyOn(service, 'findAllUser')
        .mockImplementation(() => Promise.resolve(expectedRes));
      const result = await controller.findAllUser();
      expect(result).toEqual(expectedRes);
      expect(mockFunction).toBeCalledTimes(1);
    });
  });
});
