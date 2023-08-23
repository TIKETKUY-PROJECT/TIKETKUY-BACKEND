import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CommonResponse } from 'src/common/dto';
import { Roles } from 'src/common/decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

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
