import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LearningPathFollowingResponseDto {
  @ApiProperty({ example: 1, description: 'Learning path ID' })
  learningPathId!: number;

  @ApiProperty({ example: 'Frontend Developer Roadmap', description: 'Learning path title' })
  title!: string;

  @ApiPropertyOptional({ example: 'A comprehensive roadmap for becoming a Frontend Developer', description: 'Learning path description' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg', description: 'Learning path banner image URL' })
  thumbnailUrl?: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Timestamp when the user followed this learning path' })
  followedAt!: Date;

  constructor(data: Partial<LearningPathFollowingResponseDto>) {
    Object.assign(this, data);
  }
}