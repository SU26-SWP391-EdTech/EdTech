import { IsInt, Min } from "class-validator";

export class AddCourseToLearningPathDto {
    @IsInt()
    @Min(1)
    courseId!: number;

    @IsInt()
    @Min(1)
    position!: number;
}