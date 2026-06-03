import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAcademicUserInfoDto {
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
  @IsNumber()
  experienceYears?: number;
}
