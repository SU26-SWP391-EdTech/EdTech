import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdatePlatformSettingDto {
    @IsOptional()
    @IsString()
    platformName?: string;

    @IsOptional()
    @IsEmail()
    platformEmail?: string;

    @IsOptional()
    @IsUrl()
    logoUrl?: string;

    @IsOptional()
    @IsUrl()
    bannerUrl?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
