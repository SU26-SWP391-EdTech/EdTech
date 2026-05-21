import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is not empty' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is not empty' })
  password: string;
}
