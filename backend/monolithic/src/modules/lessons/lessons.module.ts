import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../courses/entities/course.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonsRepository } from './lessons.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Lesson, Course]),
    ],
    controllers: [LessonsController],
    providers: [
        LessonsService,
        LessonsRepository,
    ],
    exports: [
        LessonsService,
        LessonsRepository,
    ],
})
export class LessonsModule { }
