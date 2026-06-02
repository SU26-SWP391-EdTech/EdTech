import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email đăng nhập',
  })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is not empty' })
  email!: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Mật khẩu đăng nhập',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is not empty' })
  password!: string;
}
