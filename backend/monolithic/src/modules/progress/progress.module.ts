import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearnerLessonProgress } from './entities/learner-lesson-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    LearnerLessonProgress
  ])]
})
export class ProgressModule { }
