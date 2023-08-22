import { Body, Controller, Post } from '@nestjs/common';
import { AuthRequest } from './dto';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('login')
  async login(@Body() dto: AuthRequest) {
    return await this.authService.login(dto);
  }

  @Post('signup')
  async signup(@Body() dto: AuthRequest) {
    return await this.authService.signUp(dto);
  }
}
