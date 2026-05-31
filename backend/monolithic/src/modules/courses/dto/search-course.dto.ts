import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseStatus } from 'src/common/enums/course.enum';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class SearchCourseDto {

    @IsOptional()
    @IsString()
    search?: string;


    @IsOptional()
    @IsEnum(CourseStatus)
    status?: CourseStatus;


    @IsOptional()
    @IsString()
    language?: string;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minDuration?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    maxDuration?: number;


    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}
