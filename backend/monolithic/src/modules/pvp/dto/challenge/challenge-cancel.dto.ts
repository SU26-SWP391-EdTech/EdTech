import { IsInt, Min } from 'class-validator';

export class ChallengeCancelDto {
  @IsInt()
  @Min(1)
  challengeId: number;
}