import { CommonResponse, Roles, RolesGuard } from '@modules/common';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('api/v1/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  @ApiTags('User')
  @ApiOkResponse({ type: CommonResponse })
  @Roles('ADMIN')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAllUser() {
    return await this.userService.findAllUser();
  }
}
