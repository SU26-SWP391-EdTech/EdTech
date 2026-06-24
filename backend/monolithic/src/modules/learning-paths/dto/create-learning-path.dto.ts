import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { LearningPathLevel } from 'src/common/enums/learning-path.enum';

export class CreateLearningPathDto {
  @ApiProperty({
    example: 'Frontend Developer Roadmap',
    description: 'Learning path title',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    example: 'A comprehensive roadmap for becoming a Frontend Developer, covering HTML, CSS, JavaScript, React, and modern web development practices.',
    description: 'Learning path description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/frontend-roadmap.jpg',
    description: 'Banner image URL',
  })
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional({
    enum: LearningPathLevel,
    example: LearningPathLevel.BEGINNER,
    description: 'Learning path difficulty level',
  })
  @IsEnum(LearningPathLevel)
  @IsOptional()
  level?: LearningPathLevel;

  @ApiPropertyOptional({
    example: 'frontend-developer-roadmap',
    description: 'Learning path slug',
  })
  @IsString()
  @IsOptional()
  slug?: string;
}