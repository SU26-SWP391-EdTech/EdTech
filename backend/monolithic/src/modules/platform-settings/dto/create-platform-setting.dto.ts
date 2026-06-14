import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlatformSettingDto {
    @ApiProperty({ description: 'Name of the platform', example: 'EdTech Learning Platform' })
    @IsNotEmpty()
    @IsString()
    platformName!: string;

    @ApiProperty({ description: 'Contact email of the platform', example: 'support@edtech.example.com' })
    @IsNotEmpty()
    @IsEmail()
    platformEmail!: string;

    @ApiPropertyOptional({ description: 'URL of the platform logo', example: 'https://example.com/logo.png' })
    @IsOptional()
    @IsUrl()
    logoUrl?: string;

    @ApiPropertyOptional({ description: 'URL of the platform banner', example: 'https://example.com/banner.png' })
    @IsOptional()
    @IsUrl()
    bannerUrl?: string;

    @ApiPropertyOptional({ description: 'Description of the platform', example: 'The best platform for online learning' })
    @IsOptional()
    @IsString()
    description?: string;
}
