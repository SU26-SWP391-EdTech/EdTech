import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CourseStatus } from 'src/common/enums/course.enum';

function parseTags(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : value;
  } catch {
    return trimmed.split(',');
  }
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiPropertyOptional({
    enum: CourseStatus,
    example: CourseStatus.PENDING,
    description: 'Course status',
  })
  @IsOptional()
  @IsEnum(CourseStatus, { message: 'Course status is invalid' })
  status?: CourseStatus;

  @ApiPropertyOptional({
    type: [String],
    example: ['Backend', 'AI'],
    description: 'Official course tags. Course Provider cannot edit this after approval.',
  })
  @IsOptional()
  @Transform(({ value }) => parseTags(value))
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
}
