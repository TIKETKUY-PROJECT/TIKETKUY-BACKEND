import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService],
    }).compile();
    controller = module.get(UserController);
    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return empty list', async () => {
      const mockFunction = jest
        .spyOn(service, 'findAllUser')
        .mockImplementation(() => Promise.resolve([]));
      const result = await controller.findAllUser();
      expect(result).toEqual([]);
      expect(mockFunction).toBeCalledTimes(1);
    });
  });
});
