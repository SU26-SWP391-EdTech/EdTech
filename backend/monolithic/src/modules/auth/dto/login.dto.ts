import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@system.com',
    description: 'Email đăng nhập',
  })
  @IsEmail({}, { message: 'Wrong email pattern' })
  @IsNotEmpty({ message: 'Email is not empty' })
  email!: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'Mật khẩu đăng nhập',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is not empty' })
  @MinLength(8, { message: 'Password must have length > 8' })
  password!: string;
}
