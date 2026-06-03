import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'email-verification-token',
    description: 'Token xác thực email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
