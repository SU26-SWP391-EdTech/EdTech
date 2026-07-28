import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email người dùng',
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({
        example: 'Nguyen Van A',
        description: 'Tên đầy đủ của người dùng',
    })
    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @ApiProperty({
        example: 'Password123',
        description: 'Mật khẩu người dùng',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password!: string;

    @ApiPropertyOptional({
        example: 'https://example.com/avatar.jpg',
        description: 'URL ảnh đại diện',
    })
    @IsString()
    @IsOptional()
    avatar_url?: string;

    @ApiProperty({
        example: 'learner',
        description: 'Tên role của người dùng',
    })
    @IsString()
    @IsNotEmpty()
    roleName!: string;

    @ApiPropertyOptional({
        example: true,
        description: 'Trạng thái xác thực email (Active/Inactive)',
    })
    @IsOptional()
    isEmailVerified?: boolean;
}
