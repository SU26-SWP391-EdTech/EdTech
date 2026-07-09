import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ChallengeRequestDto {
    @ApiProperty({
        description: 'The ID of the assessment to challenge',
        example: 1,
    })
    @IsInt()
    @Min(1)
    assessmentId: number;

    @ApiProperty({
        description: 'The ID of the receiver',
        example: 1,
    })
    @IsInt()
    @Min(1)
    receiverId: number;
}