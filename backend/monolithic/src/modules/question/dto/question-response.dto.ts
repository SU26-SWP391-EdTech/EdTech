import { QuestionType } from "src/common/enums/question-type.enum";
import { ApiProperty } from '@nestjs/swagger';
import { Question } from "../entities/question.entity";

export class QuestionResponseDto {
  @ApiProperty({ example: 1, description: 'Question ID' })
  questionId: number;

  @ApiProperty({ example: 10, description: 'Assessment ID' })
  assessmentId: number;

  @ApiProperty({ example: 'What is the capital of France?', description: 'Question content' })
  content: string;

  @ApiProperty({ example: QuestionType.MULTIPLE_CHOICE_SINGLE, description: 'Question type', enum: QuestionType })
  type: QuestionType;

  @ApiProperty({ example: 5, description: 'Question point value' })
  points: number;

  @ApiProperty({ example: 1, description: 'Question order position' })
  position: number;

  constructor(question: Question) {
    this.questionId = question.questionId;
    this.assessmentId = question.assessmentId;
    this.content = question.content;
    this.type = question.type;
    this.points = Number(question.points);
    this.position = question.position;
  }
}