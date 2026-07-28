import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonsController } from './controller/lessons.controller';
import { LessonsService } from './service/lessons.service';
import { LessonsRepository } from './repository/lessons.repository';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonPrerequisite } from './entities/lesson-prerequisite.entity';
import { CoursesModule } from '../courses/courses.module';
import { LessonPrerequisiteRepository } from './repository/lesson-prerequisite.repository';
import { LessonPrerequisiteService } from './service/lesson-prerequisite.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Enrollment, LessonPrerequisite]),
    CoursesModule,
    CloudinaryModule,
    forwardRef(() => ProgressModule),
  ],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    LessonPrerequisiteService,
    LessonsRepository,
    LessonPrerequisiteRepository,
  ],
  exports: [
    LessonsService,
    LessonPrerequisiteService,
    LessonsRepository,
    LessonPrerequisiteRepository,
  ],
})
export class LessonsModule {}
