import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateBattleDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  challengeId!: number;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  assessmentId!: number;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  challengerId!: number;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  receiverId!: number;
}