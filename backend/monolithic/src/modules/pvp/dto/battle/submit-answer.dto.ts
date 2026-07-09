import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class SubmitAnswerDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  matchId!: number;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  questionId!: number;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  optionId!: number;
}
