import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class EditAcademicUserProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'Tên đầy đủ của academic user',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL ảnh đại diện',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'Software Engineering',
    description: 'Chuyên môn của academic user',
  })
  @IsOptional()
  @IsString()
  expertise?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Số năm kinh nghiệm',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  experienceYears?: number;
}
