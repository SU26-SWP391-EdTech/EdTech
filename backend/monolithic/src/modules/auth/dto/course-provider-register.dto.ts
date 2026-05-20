import { BaseRegisterDto } from "./base-register.dto";
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CourseProviderRegisterDto extends BaseRegisterDto {
    @IsString()
    @IsOptional()
    expertise?: string;

    @IsInt()
    @IsOptional()
    @Min(0)
    experienceYears?: number;
}