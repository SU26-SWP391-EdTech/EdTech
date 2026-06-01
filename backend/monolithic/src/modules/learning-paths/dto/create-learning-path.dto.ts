import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { LearningPathLevel } from 'src/common/enums/learning-path.enum';

export class CreateLearningPathDto {
  @ApiProperty({
    example: 'Frontend Developer Roadmap',
    description: 'Tên của learning path',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    example: 'Lộ trình học Backend từ cơ bản đến nâng cao',
    description: 'Mô tả learning path',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/backend-roadmap.jpg',
    description: 'URL ảnh banner',
  })
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional({
    enum: LearningPathLevel,
    example: LearningPathLevel.BEGINNER,
    description: 'Cấp độ của learning path',
  })
  @IsEnum(LearningPathLevel)
  @IsOptional()
  level?: LearningPathLevel;
}