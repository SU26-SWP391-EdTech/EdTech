import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class EnrollCourseDto {
    @ApiProperty({
        example: 1,
        description: 'ID khóa học cần đăng ký',
    })
    @IsNotEmpty()
    @IsNumber()
    courseId: number;
}
