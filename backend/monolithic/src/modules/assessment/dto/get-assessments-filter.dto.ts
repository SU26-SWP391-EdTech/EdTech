import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';

export class GetAssessmentsFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  courseId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lessonId?: number;

  @IsOptional()
  @IsEnum(AssessmentType)
  type?: AssessmentType;

  @IsOptional()
  @IsString()
  search?: string;
}
