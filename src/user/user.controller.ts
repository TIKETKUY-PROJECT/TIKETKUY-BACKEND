import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CommonResponse } from 'src/common/dto';

@Controller('api/v1/user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiTags('User')
  @Get('all')
  @ApiOkResponse({ type: CommonResponse })
  @UseGuards(AuthGuard('jwt'))
  async findAllUser() {
    return await this.userService.findAllUser();
  }
}
