import { Type } from "class-transformer";
import { IsInt, IsNumber, Min } from "class-validator";

export class ChallengeRejectDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsNumber()
  challengeId!: number;
}