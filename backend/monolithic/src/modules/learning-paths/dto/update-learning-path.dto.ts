import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { LearningPathLevel } from 'src/common/enums/learning-path.enum';

export class UpdateLearningPathDto {
    @ApiPropertyOptional({
        example: 'Frontend Developer Roadmap',
        description: 'Title of the learning path',
        maxLength: 255,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    title?: string;

    @ApiPropertyOptional({
        example: 'A structured roadmap designed to guide learners from basic to advanced concepts.',
        description: 'Description of the learning path',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/images/roadmap.jpg',
        description: 'Banner image URL of the learning path',
    })
    @IsString()
    @IsOptional()
    bannerUrl?: string;

    @ApiPropertyOptional({
        enum: LearningPathLevel,
        example: LearningPathLevel.BEGINNER,
        description: 'Difficulty level of the learning path',
    })
    @IsEnum(LearningPathLevel)
    @IsOptional()
    level?: LearningPathLevel;
}