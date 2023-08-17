import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
  imports: [UserModule],
})
export class AuthenticationModule {}
