import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CourseStatus } from 'src/common/enums/course.enum';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  
}
