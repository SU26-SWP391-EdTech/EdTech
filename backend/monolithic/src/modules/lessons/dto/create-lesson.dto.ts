import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {

    @ApiProperty({
        example: 'Giới thiệu NestJS',
        description: 'Tên bài học',
    })
    @IsNotEmpty()
    @IsString()
    title!: string;

    @ApiPropertyOptional({
        example: 'Tổng quan về framework NestJS',
        description: 'Mô tả bài học',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/videos/lesson-1.mp4',
        description: 'URL video bài học',
    })
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiPropertyOptional({
        example: 600,
        description: 'Thời lượng video tính bằng giây',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    videoDuration?: number;

    @ApiPropertyOptional({
        example: 'Nội dung chi tiết của bài học',
        description: 'Nội dung bài học',
    })
    @IsOptional()
    @IsString()
    content?: string;
}
