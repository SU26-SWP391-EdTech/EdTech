import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCoursePositionDto {
  @ApiProperty({ description: 'The new position of the course (1-indexed)', example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  newPosition!: number;
}
