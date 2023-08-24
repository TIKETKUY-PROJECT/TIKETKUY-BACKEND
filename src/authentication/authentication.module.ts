import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@modules/prisma';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy, RtStrategy } from './strategy';

@Module({
  providers: [AuthenticationService, JwtStrategy, RtStrategy],
  controllers: [AuthenticationController],
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
})
export class AuthenticationModule {}
