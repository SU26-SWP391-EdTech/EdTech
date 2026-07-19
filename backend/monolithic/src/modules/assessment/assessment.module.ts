import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from './entities/assessment.entity';
import { AssessmentSession } from './entities/assessment-session.entity';
import { AssessmentController } from './controller/assessment.controller';
import { AssessmentService } from './service/assessment.service';
import { AssessmentRepository } from './repository/assessment.repository';
import { CoursesModule } from '../courses/courses.module';
import { LessonsModule } from '../lessons/lessons.module';
import { AssessmentSessionService } from './service/assessment-session.service'
import { AssessmentSessionRepository } from './repository/assessment-session.repository';
import { LearnersModule } from '../learners/learners.module';
import { AssessmentSessionController } from './controller/assessment-session.controller';
import { Question } from '../question/entities/question.entity';
import { QuestionOption } from '../question/entities/question-option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assessment, AssessmentSession, Question, QuestionOption]),
    CoursesModule,
    LessonsModule,
    LearnersModule
  ],
  controllers: [
    AssessmentController,
    AssessmentSessionController
  ],
  providers: [
    AssessmentService, 
    AssessmentRepository,
    
    AssessmentSessionService,
    AssessmentSessionRepository
    
  ],
  exports: [AssessmentService, AssessmentRepository],
})
export class AssessmentModule { }
