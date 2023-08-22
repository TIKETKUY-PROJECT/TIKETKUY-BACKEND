import { IsNotEmpty, IsEmail } from 'class-validator';

export class AuthRequest {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
