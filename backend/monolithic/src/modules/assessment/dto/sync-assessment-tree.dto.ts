import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';
import { QuestionType } from 'src/common/enums/question-type.enum';

export class SyncQuestionOptionDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  optionId?: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsInt()
  @Min(1)
  position: number;
}

export class SyncQuestionDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  questionId?: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsNumber()
  @IsPositive()
  points: number;

  @IsInt()
  @Min(1)
  position: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncQuestionOptionDto)
  options: SyncQuestionOptionDto[];
}

export class SyncAssessmentDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  assessmentId?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(AssessmentType)
  type: AssessmentType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncQuestionDto)
  questions: SyncQuestionDto[];
}

export class SyncAssessmentTreeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncAssessmentDto)
  assessments: SyncAssessmentDto[];
}
