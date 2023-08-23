import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthRequest } from './dto';
import { AuthenticationService } from './authentication.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommonResponse } from 'src/common/dto';

@ApiTags('Authentication')
@Controller('api/v1/authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('login')
  @ApiCreatedResponse({ type: CommonResponse })
  @ApiUnauthorizedResponse({ description: 'Email or password is incorrect!' })
  async login(@Body() dto: AuthRequest) {
    return await this.authService.login(dto);
  }

  @Post('signup')
  @ApiCreatedResponse({ type: CommonResponse })
  @ApiUnauthorizedResponse({ description: 'Email has been registered!' })
  async signup(@Body() dto: AuthRequest) {
    return await this.authService.signUp(dto);
  }
}
