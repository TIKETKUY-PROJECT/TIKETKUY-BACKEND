import { CommonResponse } from '@modules/common/dto';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { AuthRequest } from './dto';

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

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req) {
    const user = req.user;
    return await this.authService.logout(user.id);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req) {
    const user = req.user;
    return await this.authService.refresh(user.id, user.refreshToken);
  }
}
