import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateLearnerInfoDto {
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
