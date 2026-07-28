import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: 'Nguyen Van A',
        description: 'Tên đầy đủ của người dùng',
    })
    @IsString()
    @IsOptional()
    fullName?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/avatar.jpg',
        description: 'URL ảnh đại diện',
    })
    @IsString()
    @IsOptional()
    avatar_url?: string;

    @ApiPropertyOptional({
        example: true,
        description: 'Trạng thái xác thực email (Active/Inactive)',
    })
    @IsBoolean()
    @IsOptional()
    isEmailVerified?: boolean;
}
