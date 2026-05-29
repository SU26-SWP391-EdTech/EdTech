import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAcademicUserInfoDto {
  @IsOptional()
  @IsString()
  expertise?: string;

  @IsOptional()
  @IsNumber()
  experienceYears?: number;
}
