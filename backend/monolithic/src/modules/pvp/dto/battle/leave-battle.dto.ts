import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class LeaveBattleDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  matchId!: number;
}
