import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonsRepository } from './lessons.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonPrerequisite } from './entities/lesson-prerequisite.entity';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lesson,
      Enrollment,
      LessonPrerequisite
    ]),
    CoursesModule,
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
