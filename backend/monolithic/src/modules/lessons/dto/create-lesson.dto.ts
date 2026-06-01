import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {

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
    @Type(() => Number)
    @IsNumber()
    videoDuration?: number;

    @IsOptional()
    @IsString()
    content?: string;
}
