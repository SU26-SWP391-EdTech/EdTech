import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionOption } from '../entities/question-option.entity';

export class QuestionOptionResponseDto {
  @ApiProperty({ example: 1, description: 'Option ID' })
  optionId: number;

  @ApiProperty({ example: 10, description: 'Question ID' })
  questionId: number;

  @ApiProperty({ example: 'Paris', description: 'Option content' })
  content: string;

  @ApiProperty({ example: false, description: 'Whether this option is correct' })
  isCorrect: boolean;

  @ApiProperty({ example: 1, description: 'Option order position' })
  position: number;

  @ApiPropertyOptional({ example: 'What is the capital of France?', description: 'Related question content' })
  questionContent?: string;

  constructor(option: QuestionOption) {
    this.optionId = option.optionId;
    this.questionId = option.questionId;
    this.content = option.content;
    this.isCorrect = option.isCorrect;
    this.position = option.position;
    this.questionContent = option.question?.content;
  }
}