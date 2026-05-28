import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateCourseProviderProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
