import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateCourseProviderInfoDto {
  @IsOptional()
  @IsString()
  expertise?: string;

  @IsOptional()
  @IsNumber()
  experienceYears?: number;
}
