import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
    @IsNotEmpty()
    @IsNumber()
    courseId!: number;

    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    videoUrl?: string;

    @IsOptional()
    @IsNumber()
    videoDuration?: number;

    @IsOptional()
    @IsString()
    content?: string;
}
