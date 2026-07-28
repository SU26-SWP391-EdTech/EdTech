import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCourseToLearningPathDto {
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1, description: 'ID of course to add', minimum: 1 })
  courseId!: number;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1, description: 'Position in learning path', minimum: 1 })
  position!: number;
}