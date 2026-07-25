import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectCourseDto {
  @ApiProperty({ example: 'Please add practical examples to the first lesson.' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}