import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
  imports: [UserService],
})
export class AuthenticationModule {}
