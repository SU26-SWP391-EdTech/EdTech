import { IsArray, IsNumber } from "class-validator";

export class ReorderLessonsDto {
    @IsArray()
    @IsNumber({}, { each: true })
    lessonIds: number[];
}
