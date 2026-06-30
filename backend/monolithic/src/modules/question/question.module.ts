import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { LessonsService } from '../lessons/service/lessons.service';
import { AssessmentService } from '../assessment/assessment.service';
import { QuestionRepository } from './question.repository';
import { LessonsRepository } from '../lessons/repository/lessons.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Assessment } from '../assessment/entities/assessment.entity';
import { AssessmentRepository } from '../assessment/assessment.repository';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Course } from '../courses/entities/course.entity';
import { CoursesRepository } from '../courses/courses.repository';
import { User } from '../users/entities/user.entity';
import { QuestionOptionRepository } from './question-option.repository';
import { LessonPrerequisite } from '../lessons/entities/lesson-prerequisite.entity';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      QuestionOption,
      Enrollment,
      Assessment,
      Lesson,
      Course,
      User,
      LessonPrerequisite,
    ]),
    LessonsModule
  ],
  controllers: [QuestionController],
  providers: [
    QuestionService,
    LessonsService,
    AssessmentService,
    QuestionRepository,
    LessonsRepository,
    CloudinaryService,
    CoursesService,
    EnrollmentsRepository,
    AssessmentRepository,
    CoursesRepository,
    QuestionOptionRepository,
  ],
  exports: [
    QuestionService,
    LessonsService,
    AssessmentService,
    QuestionRepository,
    QuestionOptionRepository,
  ],
})
export class QuestionModule {}
