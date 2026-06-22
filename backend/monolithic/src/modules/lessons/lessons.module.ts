import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../courses/entities/course.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonsRepository } from './lessons.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonPrerequisite } from './entities/lesson-prerequisite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lesson,
      Course,
      Enrollment,
      LessonPrerequisite
    ]),
  ],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    LessonsRepository,
    CloudinaryService,
  ],
  exports: [
    LessonsService,
    LessonsRepository,
    CloudinaryService
  ],
})
export class LessonsModule { }
