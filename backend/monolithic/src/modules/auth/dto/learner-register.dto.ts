import { BaseRegisterDto } from "./base-register.dto";
import { IsString, IsOptional } from 'class-validator';

export class LearnerRegisterDto extends BaseRegisterDto{
    @IsString()
    @IsOptional()
    learningGoal?: string;

    @IsString()
    @IsOptional()
    level?: string; // beginner, intermediate, advanced

    @IsString()
    @IsOptional()
    bio?: string;
}