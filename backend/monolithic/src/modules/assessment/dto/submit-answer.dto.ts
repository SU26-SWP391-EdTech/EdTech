import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
    @IsInt()
    questionId: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    selectedOptionIds: number[];
}

export class SubmitAssessmentDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmitAnswerDto)
    answers: SubmitAnswerDto[];
}