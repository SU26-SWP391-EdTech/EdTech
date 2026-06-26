import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearnerLessonProgress } from './entities/learner-lesson-progress.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProgressRepository } from './progress.repository';
import { LessonsModule } from '../lessons/lessons.module';
import { LearnersModule } from '../learners/learners.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    LearnerLessonProgress
  ]),
  LessonsModule,
  LearnersModule
  ],
  controllers: [ProgressController],
  providers: [
    ProgressService,
    ProgressRepository
  ]
})
export class ProgressModule { }
