import { IsInt, Min } from "class-validator";

export class ChallengeApproveDto{
    @IsInt()
    @Min(1)
    challengeId: number;
}