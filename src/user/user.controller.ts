import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  async findAllUser(): Promise<any> {
    return await this.userService.findAllUser();
  }
}
