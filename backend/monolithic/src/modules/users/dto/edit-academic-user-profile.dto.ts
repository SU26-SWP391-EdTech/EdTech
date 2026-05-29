import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class EditAcademicUserProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  expertise?: string;

  @IsOptional()
  @IsNumber()
  experienceYears?: number;
}
