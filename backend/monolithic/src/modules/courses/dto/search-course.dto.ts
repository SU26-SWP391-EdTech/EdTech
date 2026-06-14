import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseStatus } from 'src/common/enums/course.enum';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class SearchCourseDto {

    @ApiPropertyOptional({
        example: 'javascript',
        description: 'Từ khóa tìm kiếm theo tên hoặc nội dung khóa học',
    })
    @IsOptional()
    @IsString()
    search?: string;


    @ApiPropertyOptional({
        enum: CourseStatus,
        example: CourseStatus.APPROVED,
        description: 'Trạng thái khóa học',
    })
    @IsOptional()
    @IsEnum(CourseStatus)
    status?: CourseStatus;


    @ApiPropertyOptional({
        example: 'vi',
        description: 'Ngôn ngữ khóa học',
    })
    @IsOptional()
    @IsString()
    language?: string;


    @ApiPropertyOptional({
        example: 30,
        description: 'Thời lượng tối thiểu tính bằng phút',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minDuration?: number;

    @ApiPropertyOptional({
        example: 180,
        description: 'Thời lượng tối đa tính bằng phút',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    maxDuration?: number;


    @ApiPropertyOptional({
        example: 'createdAt',
        description: 'Field dùng để sắp xếp',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        enum: SortOrder,
        example: SortOrder.DESC,
        description: 'Thứ tự sắp xếp',
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({
        example: 1,
        description: 'ID người tạo khóa học (Provider)',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    userId?: number;
}
