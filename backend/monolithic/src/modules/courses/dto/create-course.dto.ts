import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
