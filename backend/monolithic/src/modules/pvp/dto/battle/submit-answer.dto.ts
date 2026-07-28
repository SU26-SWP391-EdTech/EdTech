import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, IsArray } from 'class-validator';

export class SubmitAnswerDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  matchId!: number;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  questionId!: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  optionId?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  optionIds?: number[];
}
