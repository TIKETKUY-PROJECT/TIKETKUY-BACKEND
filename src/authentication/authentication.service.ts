import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthenticationService {
  constructor(private userService: UserService) {}

  async login(): Promise<User[]> {
    return await this.userService.findAllUser();
  }
}
