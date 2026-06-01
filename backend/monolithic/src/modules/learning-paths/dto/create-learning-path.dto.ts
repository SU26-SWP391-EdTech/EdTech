import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { LearningPathLevel } from 'src/common/enums/learning-path.enum';

export class CreateLearningPathDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsEnum(LearningPathLevel)
  @IsOptional()
  level?: LearningPathLevel;
}
