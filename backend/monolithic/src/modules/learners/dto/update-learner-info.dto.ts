import { IsString, IsOptional } from 'class-validator';

export class UpdateLearnerInfoDto {
  @IsOptional()
  @IsString()
  learningGoal?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}