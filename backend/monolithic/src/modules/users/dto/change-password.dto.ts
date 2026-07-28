import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    MinLength,
  } from 'class-validator';
  
  export class ChangePasswordDto {
    @ApiProperty({
      example: 'OldPassword123',
      description: 'Mật khẩu hiện tại',
    })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;
  
    @ApiProperty({
      example: 'NewPassword123',
      description: 'Mật khẩu mới',
      minLength: 6,
    })
    @IsString()
    @MinLength(6)
    newPassword: string;
  }
