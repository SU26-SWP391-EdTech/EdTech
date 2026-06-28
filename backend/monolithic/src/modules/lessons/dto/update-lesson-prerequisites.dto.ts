import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, ArrayUnique } from 'class-validator';

export class UpdateLessonPrerequisitesDto {
  @ApiProperty({
    type: [Number],
    description: 'List of prerequisite lesson IDs',
    example: [1, 2],
  })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  @ArrayUnique()
  prerequisiteLessonIds!: number[];
}
