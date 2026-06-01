import { IsNotEmpty, IsNumber } from 'class-validator';

export class EnrollCourseDto {
    @IsNotEmpty()
    @IsNumber()
    courseId: number;
}
