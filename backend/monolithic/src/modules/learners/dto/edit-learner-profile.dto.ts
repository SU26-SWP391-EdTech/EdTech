import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class EditLearnerProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'Tên đầy đủ của learner',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL ảnh đại diện',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'Trở thành backend developer',
    description: 'Mục tiêu học tập',
  })
  @IsOptional()
  @IsString()
  learningGoal?: string;

  @ApiPropertyOptional({
    example: 'beginner',
    description: 'Trình độ hiện tại',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    example: 'Tôi đang học lập trình web',
    description: 'Giới thiệu ngắn về learner',
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
