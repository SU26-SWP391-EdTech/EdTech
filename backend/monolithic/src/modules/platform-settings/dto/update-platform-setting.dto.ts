import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlatformSettingDto {
    @ApiPropertyOptional({ description: 'Name of the platform', example: 'EdTech Learning Platform' })
    @IsOptional()
    @IsString()
    platformName?: string;

    @ApiPropertyOptional({ description: 'Contact email of the platform', example: 'support@edtech.example.com' })
    @IsOptional()
    @IsEmail()
    platformEmail?: string;

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
