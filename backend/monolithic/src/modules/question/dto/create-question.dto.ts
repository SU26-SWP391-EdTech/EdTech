import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from 'src/common/enums/question-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuestionOptionDto } from './create-question-option.dto';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'What is the capital of France?',
    description: 'Question content',
    maxLength: 2000,
  })
  content: string;

  @IsEnum(QuestionType)
  @ApiProperty({
    example: QuestionType.MULTIPLE_CHOICE_SINGLE,
    description: 'Question type',
    enum: QuestionType,
  })
  type: QuestionType;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 5, description: 'Question point value', minimum: 1 })
  points: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 1, description: 'Question order position', minimum: 1 })
  position: number;
}