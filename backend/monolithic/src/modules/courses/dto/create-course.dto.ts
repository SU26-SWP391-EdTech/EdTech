import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsArray, ArrayMaxSize, MaxLength } from 'class-validator';
import { CourseStatus } from 'src/common/enums/course.enum';

export class CreateCourseDto {
  @ApiProperty({
    example: 'NestJS căn bản',
    description: 'Tên khóa học',
  })
  @IsNotEmpty({ message: 'Tên khóa học không được để trống' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    example: 'Khóa học xây dựng REST API với NestJS',
    description: 'Mô tả khóa học',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/thumbnails/nestjs.jpg',
    description: 'URL ảnh thumbnail',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/example/nestjs-course',
    description: 'URL project tham khảo',
  })
  @IsOptional()
  @IsString()
  projectUrl?: string;

  @ApiPropertyOptional({
    example: 'vi',
    description: 'Ngôn ngữ của khóa học',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    example: 120,
    description: 'Thời lượng khóa học tính bằng phút',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['Backend', 'NestJS'],
    description: 'Danh sách thẻ khóa học',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : value;
    } catch {
      return trimmed.split(',');
    }
  })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
}
