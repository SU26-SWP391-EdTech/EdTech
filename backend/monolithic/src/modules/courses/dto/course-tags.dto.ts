import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

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
    return trimmed
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
  }
}

export class CourseTagsDto {
  @ApiProperty({
    type: [String],
    example: ['Backend', 'AI'],
  })
  @Transform(({ value }) => parseTags(value))
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags!: string[];
}

export class ApproveCourseDto {
  @ApiPropertyOptional({
    type: [String],
    example: ['Backend', 'AI'],
  })
  @IsOptional()
  @Transform(({ value }) => parseTags(value))
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
}

export class CreateTagDto {
  @ApiProperty({
    example: 'Backend',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name!: string;

  @ApiPropertyOptional({
    example: 'Courses about backend development',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class BrowseCoursesByTagDto {
  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
