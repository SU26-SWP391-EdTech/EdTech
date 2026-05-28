import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateLearnerProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
