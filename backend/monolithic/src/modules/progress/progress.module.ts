import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearnerLessonProgress } from './entities/learner-lesson-progress.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProgressRepository } from './progress.repository';
import { LessonsModule } from '../lessons/lessons.module';
import { LearnersModule } from '../learners/learners.module';
import { AssessmentModule } from '../assessment/assessment.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    LearnerLessonProgress
  ]),
  forwardRef(() => LessonsModule),
  LearnersModule,
  forwardRef(() => AssessmentModule),
  ],
  controllers: [ProgressController],
  providers: [
    ProgressService,
    ProgressRepository
  ],
  exports: [
    ProgressService
  ]
})
export class ProgressModule { }
