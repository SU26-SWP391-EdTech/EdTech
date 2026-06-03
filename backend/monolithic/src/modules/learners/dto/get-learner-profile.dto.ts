import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetLearnerProfileDto {
    @ApiProperty({
        example: 'Nguyen Van A',
        description: 'Tên đầy đủ của learner',
    })
    fullName: string;

    @ApiPropertyOptional({
        example: 'learner@example.com',
        description: 'Email của learner',
    })
    email?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/avatar.jpg',
        description: 'URL ảnh đại diện',
    })
    avatarUrl?: string;

    @ApiPropertyOptional({
        example: 'Trở thành backend developer',
        description: 'Mục tiêu học tập',
    })
    learningGoal?: string;

    @ApiPropertyOptional({
        example: 'beginner',
        description: 'Trình độ hiện tại',
    })
    level?: string;

    @ApiPropertyOptional({
        example: 'Tôi đang học lập trình web',
        description: 'Giới thiệu ngắn về learner',
    })
    bio?: string;

    @ApiPropertyOptional({
        example: '2026-01-01T00:00:00.000Z',
        description: 'Thời điểm tạo profile',
    })
    createdAt?: Date;
  }
