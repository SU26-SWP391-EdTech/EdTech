import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetAcademicUserProfileDto{
    @ApiProperty({
        example: 'Nguyen Van A',
        description: 'Tên đầy đủ của academic user',
    })
    fullName: string;

    @ApiPropertyOptional({
        example: 'academic@example.com',
        description: 'Email của academic user',
    })
    email?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/avatar.jpg',
        description: 'URL ảnh đại diện',
    })
    avatarUrl?: string;

    @ApiPropertyOptional({
        example: 'Software Engineering',
        description: 'Chuyên môn của academic user',
    })
    expertise?: string;

    @ApiPropertyOptional({
        example: 5,
        description: 'Số năm kinh nghiệm',
    })
    experienceYears?: number;

    @ApiPropertyOptional({
        example: '2026-01-01T00:00:00.000Z',
        description: 'Thời điểm tạo profile',
    })
    createdAt?: Date;
}
