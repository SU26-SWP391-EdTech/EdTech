import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CourseStatus } from 'src/common/enums/course.enum';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiPropertyOptional({
    enum: CourseStatus,
    example: CourseStatus.PENDING,
    description: 'Course status',
  })
  @IsOptional()
  @IsEnum(CourseStatus, { message: 'Course status is invalid' })
  status?: CourseStatus;
}
