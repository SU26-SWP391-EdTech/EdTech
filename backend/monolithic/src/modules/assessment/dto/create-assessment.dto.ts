import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';
import { CreateQuestionDto } from 'src/modules/question/dto/create-question.dto';

export class CreateAssessmentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the course',
  })
  @IsInt()
  courseId!: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'ID of the lesson (optional for course-level assessments)',
  })
  @IsInt()
  @IsOptional()
  lessonId?: number;

  @ApiProperty({
    example: 'Lesson 1 Quiz',
    description: 'Assessment title',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    enum: AssessmentType,
    example: AssessmentType.LESSON_QUIZ,
    description: 'Assessment type',
  })
  @IsEnum(AssessmentType)
  type!: AssessmentType;

  @ApiPropertyOptional({
    type: [CreateQuestionDto],
    description: 'List of questions for this assessment',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}